/**
 * useWebRTC — configura WS + RTCPeerConnections e alimenta o useCallStore.
 * O estado em si vive no store; este hook só gerencia efeitos colaterais.
 *
 * Fluxo de negociação:
 *  - Quem entra na sala (recebe peers:list) é sempre o INITIATOR — manda offer para cada existente.
 *  - Quem já está na sala (recebe peer:joined) cria a PC e aguarda o offer do novo peer.
 *  - Isso elimina SDP glare e garante que o WS está aberto quando o offer é enviado.
 */
import { useEffect, useRef, useCallback } from 'react';
import { getClientEnv } from '../env.ts';
import { debugBus } from '../debug/event-bus.ts';
import { useCallStore, initCallStore } from '../store/useCallStore.ts';
import { toast } from '../store/useToastStore.ts';
import type { CallParams } from '../App.tsx';
import type { DebugEventDto } from '../types/debug.ts';

import type { PeerInfo, PeerMediaState } from '../store/useCallStore.ts';

export type { PeerInfo, PeerMediaState };

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export function useWebRTC(params: CallParams) {
  const { serverUrl } = getClientEnv();

  const wsRef       = useRef<WebSocket | null>(null);
  const pcsRef      = useRef(new Map<string, RTCPeerConnection>());
  const localStreamRef = useRef<MediaStream | null>(null);
  const disposedRef = useRef(false);
  const isReconnectRef = useRef(false);
  // IDs recebidos via peers:list — suprime toast de peer:joined para esses peers
  const initialPeersRef = useRef(new Set<string>());

  const store = useCallStore();

  // Registra o localStreamRef no store para que toggleCamera/toggleMic o acessem
  useEffect(() => {
    initCallStore(params);
    useCallStore.getState().setLocalStreamRef(localStreamRef);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendWs = useCallback((msg: object) => {
    const socket = wsRef.current;
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(msg));
    }
  }, []);

  // ── PeerConnection factory ────────────────────────────────────────────────

  const createPC = useCallback((peerId: string): RTCPeerConnection => {
    pcsRef.current.get(peerId)?.close();

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcsRef.current.set(peerId, pc);

    const stream = localStreamRef.current;
    const tracks = stream?.getTracks() ?? [];
    console.log(`[webrtc] createPC ${peerId} | tracks: ${tracks.length}`);
    if (stream) tracks.forEach((t) => pc.addTrack(t, stream));

    pc.ontrack = (ev) => {
      const [s] = ev.streams;
      console.log(`[webrtc] ontrack ← ${peerId} | kind: ${ev.track.kind} streams: ${ev.streams.length}`);
      if (s) {
        useCallStore.setState((state) => {
          const clone = new MediaStream(s.getTracks());
          const newRemote = new Map(state.remoteStreams).set(peerId, clone);
          // Não sobrescreve cameraOn — respeita o media:state real do peer
          return { remoteStreams: newRemote };
        });
      }
    };

    pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        sendWs({ type: 'ice-candidate', to: peerId, from: params.peerId, candidate: ev.candidate.toJSON() });
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log(`[webrtc] connectionState ${peerId}: ${state}`);
      debugBus.emit('socket', 'rtc:connection-state', { peerId, state });
      // Só remove em 'failed' — 'disconnected' é temporário, ICE pode reconectar
      if (state === 'failed') {
        pcsRef.current.delete(peerId);
      }
    };

    return pc;
  }, [params.peerId, sendWs]);

  // Cria offer e envia — usado por quem entra na sala
  const startOffer = useCallback(async (peerId: string) => {
    const pc = createPC(peerId);
    const trackCount = localStreamRef.current?.getTracks().length ?? 0;
    console.log(`[webrtc] startOffer → ${peerId} | tracks: ${trackCount}`);
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log(`[webrtc] offer criado para ${peerId}`);
      sendWs({ type: 'offer', to: peerId, from: params.peerId, sdp: pc.localDescription! });
    } catch (e) {
      console.error(`[webrtc] offer-error ${peerId}:`, e);
      debugBus.emit('system', 'rtc:offer-error', { peerId, error: String(e) });
    }
  }, [createPC, params.peerId, sendWs]);

  // ── Debug inject ─────────────────────────────────────────────────────────

  const injectDebugRef = useRef((evt: DebugEventDto) => {
    debugBus.inject({
      id: evt.id,
      origin: evt.origin as 'client' | 'server',
      role: evt.role,
      category: (evt.category as Parameters<typeof debugBus.emit>[0]) ?? 'system',
      info: evt.info,
      type: evt.info,
      payload: { peerId: evt.peerId, _role: evt.role, ...(evt.details ?? {}) },
      details: evt.details,
      ts: evt.ts,
    });
  });

  // Fetch logs da sala via REST e injeta no debugBus (dedup por id)
  const fetchRoomLogs = useCallback(async (roomId: string) => {
    try {
      // serverUrl pode ser ws://host/ws ou ws://host — extrai só a origem HTTP
      const url = new URL(serverUrl);
      const apiBase = `${url.protocol === 'wss:' ? 'https' : 'http'}://${url.host}`;
      const res = await fetch(`${apiBase}/rooms/${roomId}/logs`);
      if (!res.ok) return;
      const logs = await res.json() as DebugEventDto[];
      logs.forEach((e) => injectDebugRef.current(e));
    } catch { /* best-effort */ }
  }, [serverUrl]);

  // ── WebSocket ─────────────────────────────────────────────────────────────

  const connectWs = useCallback(async () => {
    if (disposedRef.current) return;

    // Fecha PCs anteriores
    pcsRef.current.forEach((pc) => pc.close());
    pcsRef.current.clear();

    // Remove handlers do WS anterior antes de fechar — evita toast falso de desconexão
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      wsRef.current.close();
    }

    const socket = new WebSocket(serverUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      if (disposedRef.current) { socket.close(); return; }
      useCallStore.getState().setConnected(true);
      useCallStore.getState().setWs(socket);

      const msgType = isReconnectRef.current ? 'reconnect' : 'join';
      socket.send(JSON.stringify({ type: msgType, roomId: params.roomId, peerId: params.peerId, role: params.role }));
      const ls = localStreamRef.current;
      socket.send(JSON.stringify({
        type: 'media:state', from: params.peerId,
        cameraOn: ls?.getVideoTracks().some((t) => t.enabled) ?? true,
        micOn:    ls?.getAudioTracks().some((t) => t.enabled) ?? true,
      }));
      if (getClientEnv().debugMode) socket.send(JSON.stringify({ type: 'debug:subscribe' }));

      if (isReconnectRef.current) {
        toast.success('🔄 Reconectado ao servidor');
        debugBus.emit('socket', 'peer:reconnected', { roomId: params.roomId }, { origin: 'client', role: params.role });
      } else {
        debugBus.emit('socket', 'ws:connected', { roomId: params.roomId });
      }
      isReconnectRef.current = true;
    };

    socket.onerror = () => useCallStore.getState().setError('Erro ao conectar ao servidor WS');

    socket.onclose = () => {
      if (disposedRef.current) return;
      useCallStore.getState().setConnected(false);
      useCallStore.getState().setWs(null);
      toast.error('⚠️ Servidor desconectado', 6000);
      debugBus.emit('socket', 'ws:disconnected', {});
    };

    socket.onmessage = async (event) => {
      if (disposedRef.current) return;
      const msg = JSON.parse(event.data as string) as { type: string } & Record<string, unknown>;
      const s = useCallStore.getState();

      switch (msg.type) {

        // ── Entrei na sala — lista de peers existentes ──────────────────
        case 'peers:list': {
          const peerList = msg['peers'] as PeerInfo[];
          s.setPeers(peerList);
          s.initPeerMediaStates(peerList);
          initialPeersRef.current = new Set(peerList.map((p) => p.id));
          setTimeout(() => initialPeersRef.current.clear(), 3000);
          if (peerList.length > 0) toast.info(`👥 ${peerList.length} participante(s) já na sala`);
          debugBus.emit('media', 'room:joined', { existingPeers: peerList.length });

          // Quem entra é o initiator — manda offer para cada peer existente
          for (const peer of peerList) {
            await startOffer(peer.id);
          }

          // Carrega histórico de logs
          void fetchRoomLogs(params.roomId);
          break;
        }

        // ── Novo peer entrou — aguardo o offer dele ─────────────────────
        case 'peer:joined': {
          const peer = msg['peer'] as PeerInfo;
          s.addPeer(peer);
          // Não pré-seta cameraOn:false — aguarda media:state real do peer
          debugBus.emit('media', 'peer:joined', { peerId: peer.id, role: peer.role ?? 'unknown' });
          if (!initialPeersRef.current.has(peer.id)) toast.info(`${roleLabel(peer.role)} entrou na chamada`);

          // Cria PC para receber o offer que o novo peer vai mandar
          createPC(peer.id);

          // Envia meu estado de mídia atual para o novo peer
          const ls = localStreamRef.current;
          sendWs({
            type: 'media:state', to: peer.id,
            cameraOn: ls?.getVideoTracks().some((t) => t.enabled) ?? false,
            micOn:    ls?.getAudioTracks().some((t) => t.enabled) ?? false,
          });
          break;
        }

        case 'peer:left': {
          const peerId = msg['peerId'] as string;
          const leaving = s.peers.find((p) => p.id === peerId);
          pcsRef.current.get(peerId)?.close();
          pcsRef.current.delete(peerId);
          s.removePeer(peerId);
          debugBus.emit('media', 'peer:left', { peerId });
          toast.warning(`${roleLabel(leaving?.role)} saiu da chamada`);
          break;
        }

        case 'media:state': {
          const { from, cameraOn: cam, micOn: mic } = msg as unknown as { from: string; cameraOn: boolean; micOn: boolean };
          console.log(`[webrtc] media:state ← ${from} | cameraOn: ${cam} micOn: ${mic}`);
          s.setPeerMediaState(from, { cameraOn: cam, micOn: mic });
          break;
        }

        // ── Offer recebido — sou o respondente ─────────────────────────
        case 'offer': {
          const from = msg['from'] as string;
          let pc = pcsRef.current.get(from);
          console.log(`[webrtc] offer ← ${from} | pc exists: ${!!pc}`);
          if (!pc) pc = createPC(from);
          await pc.setRemoteDescription(msg['sdp'] as RTCSessionDescriptionInit);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          console.log(`[webrtc] answer → ${from} | signalingState: ${pc.signalingState}`);
          sendWs({ type: 'answer', to: from, from: params.peerId, sdp: answer });
          break;
        }

        case 'answer': {
          const from = msg['from'] as string;
          const pc = pcsRef.current.get(from);
          console.log(`[webrtc] answer ← ${from} | pc exists: ${!!pc} signalingState: ${pc?.signalingState}`);
          if (pc) await pc.setRemoteDescription(msg['sdp'] as RTCSessionDescriptionInit);
          break;
        }

        case 'ice-candidate': {
          const pc = pcsRef.current.get(msg['from'] as string);
          if (pc) await pc.addIceCandidate(msg['candidate'] as RTCIceCandidateInit);
          break;
        }

        case 'debug:broadcast': {
          injectDebugRef.current(msg['event'] as DebugEventDto);
          break;
        }
        case 'debug:history': {
          (msg['events'] as DebugEventDto[]).forEach((e) => injectDebugRef.current(e));
          break;
        }
      }
    };
  }, [serverUrl, params, sendWs, createPC, startOffer, fetchRoomLogs]);

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  useEffect(() => {
    disposedRef.current = false;
    isReconnectRef.current = false;

    async function init() {
      // Garante stream fresco (StrictMode pode ter parado o anterior no cleanup)
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch (e) {
        useCallStore.getState().setError(`Permissão de câmera/microfone negada: ${String(e)}`);
        return;
      }
      if (disposedRef.current) { stream.getTracks().forEach((t) => t.stop()); return; }

      // Inicia com câmera e mic desligados
      stream.getTracks().forEach((t) => { t.enabled = false; });
      localStreamRef.current = stream;
      useCallStore.getState().setLocalStream(stream);

      await connectWs();
    }

    init().catch((e) => useCallStore.getState().setError(String(e)));

    // Política de reconexão por foco / visibilidade
    const tryReconnect = () => {
      const ws = wsRef.current;
      if (!disposedRef.current && (!ws || ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING)) {
        connectWs().catch(console.error);
      }
    };

    const onVisibility = () => { if (document.visibilityState === 'visible') tryReconnect(); };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', tryReconnect);

    return () => {
      disposedRef.current = true;
      wsRef.current?.close();
      pcsRef.current.forEach((pc) => pc.close());
      pcsRef.current.clear();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', tryReconnect);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ws: store.ws };
}

function roleLabel(role?: string): string {
  const labels: Record<string, string> = { patient: '👤 Paciente', professional: '🩺 Profissional' };
  return role ? (labels[role] ?? role) : 'Participante';
}
