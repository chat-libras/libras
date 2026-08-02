/**
 * useWebRTC — configura WS + RTCPeerConnections e alimenta o useCallStore.
 * O estado em si vive no store; este hook só gerencia efeitos colaterais.
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

  const wsRef = useRef<WebSocket | null>(null);
  const pcsRef = useRef(new Map<string, RTCPeerConnection>());
  const localStreamRef = useRef<MediaStream | null>(null);

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
      debugBus.emit('socket', (msg as { type: string }).type, msg as Record<string, unknown>);
    }
  }, []);

  const createPeerConnection = useCallback(
    (peerId: string): RTCPeerConnection => {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pcsRef.current.set(peerId, pc);

      localStreamRef.current?.getTracks().forEach((t) => {
        pc.addTransceiver(t, { direction: 'sendrecv', streams: [localStreamRef.current!] });
      });

      pc.ontrack = (event) => {
        const [stream] = event.streams;
        useCallStore.getState().setRemoteStream(peerId, stream);
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendWs({ type: 'ice-candidate', to: peerId, from: params.peerId, candidate: event.candidate.toJSON() });
        }
      };

      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        debugBus.emit('socket', 'rtc:connection-state', { peerId, state });
        if (state === 'disconnected' || state === 'failed' || state === 'closed') {
          pcsRef.current.delete(peerId);
          useCallStore.getState().removePeer(peerId);
        }
      };

      return pc;
    },
    [params.peerId, sendWs],
  );

  // Injeta evento recebido do servidor no debugBus local
  const injectDebugRef = useRef((evt: DebugEventDto) => {
    debugBus.emit(
      evt.category as Parameters<typeof debugBus.emit>[0],
      evt.info,
      { peerId: evt.peerId, _role: evt.role, ...(evt.details ?? {}) },
      { origin: evt.origin as 'client' | 'server', role: evt.role, details: evt.details ?? undefined },
    );
  });

  const isReconnectRef = useRef(false);
  const disposedRef = useRef(false);

  const connectWs = useCallback(async () => {
    if (disposedRef.current) return;

    // fecha PCs antigos na reconexão
    pcsRef.current.forEach((pc) => pc.close());
    pcsRef.current.clear();

    const socket = new WebSocket(serverUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      if (disposedRef.current) { socket.close(); return; }
      useCallStore.getState().setConnected(true);
      useCallStore.getState().setWs(socket);

      const msgType = isReconnectRef.current ? 'reconnect' : 'join';
      sendWs({ type: msgType, roomId: params.roomId, peerId: params.peerId, role: params.role });
      sendWs({ type: 'media:state', from: params.peerId, cameraOn: false, micOn: false });
      if (getClientEnv().debugMode) sendWs({ type: 'debug:subscribe' });

      if (isReconnectRef.current) {
        toast.success('🔄 Reconectado ao servidor');
        debugBus.emit('socket', 'peer:reconnected', { roomId: params.roomId }, { origin: 'client', role: params.role });
      } else {
        // sem toast — o usuário sabe que entrou, não precisa ser informado
        debugBus.emit('socket', 'ws:connected', { roomId: params.roomId });
      }
      isReconnectRef.current = true; // toda conexão futura é reconexão
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
      const msg = JSON.parse(event.data as string) as { type: string } & Record<string, unknown>;
      debugBus.emit('socket', msg.type, msg);
      const s = useCallStore.getState();

      switch (msg.type) {
        case 'peers:list': {
          const peerList = msg['peers'] as PeerInfo[];
          s.setPeers(peerList);
          s.initPeerMediaStates(peerList);
          debugBus.emit('media', 'room:joined', { existingPeers: peerList.length });
          if (peerList.length > 0) {
            toast.info(`👥 ${peerList.length} participante(s) já na sala`);
          }
          for (const peer of peerList) {
            const pc = createPeerConnection(peer.id);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            sendWs({ type: 'offer', to: peer.id, from: params.peerId, sdp: offer });
          }
          break;
        }
        case 'media:state': {
          const { from, cameraOn: cam, micOn: mic } = msg as unknown as { from: string; cameraOn: boolean; micOn: boolean };
          s.setPeerMediaState(from, { cameraOn: cam, micOn: mic });
          debugBus.emit('media', 'peer:media-state', { from, cameraOn: cam, micOn: mic });
          break;
        }
        case 'peer:joined': {
          const peer = msg['peer'] as PeerInfo;
          s.addPeer(peer);
          s.setPeerMediaState(peer.id, { cameraOn: false, micOn: false });
          debugBus.emit('media', 'peer:joined', { peerId: peer.id, role: peer.role ?? 'unknown' });
          toast.info(`${roleLabel(peer.role)} entrou na chamada`);
          createPeerConnection(peer.id);
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
        case 'offer': {
          const from = msg['from'] as string;
          const pc = pcsRef.current.get(from) ?? createPeerConnection(from);
          await pc.setRemoteDescription(msg['sdp'] as RTCSessionDescriptionInit);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendWs({ type: 'answer', to: from, from: params.peerId, sdp: answer });
          break;
        }
        case 'answer': {
          const pc = pcsRef.current.get(msg['from'] as string);
          if (pc) await pc.setRemoteDescription(msg['sdp'] as RTCSessionDescriptionInit);
          break;
        }
        case 'ice-candidate': {
          const pc = pcsRef.current.get(msg['from'] as string);
          if (pc) await pc.addIceCandidate(msg['candidate'] as RTCIceCandidateInit);
          break;
        }
        case 'debug:broadcast': {
          const evt = msg['event'] as DebugEventDto;
          injectDebugRef.current(evt);
          break;
        }
        case 'debug:history': {
          const evts = msg['events'] as DebugEventDto[];
          evts.forEach((e) => injectDebugRef.current(e));
          break;
        }
      }
    };
  }, [serverUrl, params, sendWs, createPeerConnection]);

  useEffect(() => {
    disposedRef.current = false;
    isReconnectRef.current = false;

    async function init() {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch (e) {
        useCallStore.getState().setError(`Permissão de câmera/microfone negada: ${String(e)}`);
        return;
      }
      if (disposedRef.current) { stream.getTracks().forEach((t) => t.stop()); return; }

      stream.getVideoTracks().forEach((t) => { t.enabled = false; });
      stream.getAudioTracks().forEach((t) => { t.enabled = false; });
      localStreamRef.current = stream;
      useCallStore.getState().setLocalStream(stream);

      await connectWs();
    }

    init().catch((e) => useCallStore.getState().setError(String(e)));

    // ── Política de reconexão por foco / visibilidade ─────────────────────
    // Quando o usuário volta à aba e o WS está fechado, tenta reconectar.
    const tryReconnect = () => {
      const ws = wsRef.current;
      if (
        !disposedRef.current &&
        (!ws || ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING)
      ) {
        console.log('[ws] reconectando por foco na aba…');
        connectWs().catch(console.error);
      }
    };

    const onVisibility = () => { if (document.visibilityState === 'visible') tryReconnect(); };
    const onFocus = () => tryReconnect();

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);

    return () => {
      disposedRef.current = true;
      wsRef.current?.close();
      pcsRef.current.forEach((pc) => pc.close());
      pcsRef.current.clear();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Retorna apenas o que é necessário externamente (ws para o useChat)
  return { ws: store.ws };
}

function roleLabel(role?: string): string {
  const labels: Record<string, string> = {
    patient:      '👤 Paciente',
    professional: '🩺 Profissional',
  };
  return role ? (labels[role] ?? role) : 'Participante';
}
