/**
 * useWebRTC — configura WS + RTCPeerConnections e alimenta o useCallStore.
 * O estado em si vive no store; este hook só gerencia efeitos colaterais.
 */
import { useEffect, useRef, useCallback } from 'react';
import { getClientEnv } from '../env.ts';
import { debugBus } from '../debug/event-bus.ts';
import { useCallStore, initCallStore } from '../store/useCallStore.ts';
import type { CallParams } from '../App.tsx';

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

  useEffect(() => {
    let disposed = false;

    async function init() {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch (e) {
        useCallStore.getState().setError(`Permissão de câmera/microfone negada: ${String(e)}`);
        return;
      }
      if (disposed) { stream.getTracks().forEach((t) => t.stop()); return; }

      stream.getVideoTracks().forEach((t) => { t.enabled = false; });
      stream.getAudioTracks().forEach((t) => { t.enabled = false; });
      localStreamRef.current = stream;
      useCallStore.getState().setLocalStream(stream);

      const socket = new WebSocket(serverUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        useCallStore.getState().setConnected(true);
        useCallStore.getState().setWs(socket);
        sendWs({ type: 'join', roomId: params.roomId, peerId: params.peerId, role: params.role });
        sendWs({ type: 'media:state', from: params.peerId, cameraOn: false, micOn: false });
        debugBus.emit('socket', 'ws:connected', { roomId: params.roomId });
      };

      socket.onerror = () => useCallStore.getState().setError('Erro ao conectar ao servidor WS');
      socket.onclose = () => {
        useCallStore.getState().setConnected(false);
        useCallStore.getState().setWs(null);
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
            createPeerConnection(peer.id);
            break;
          }
          case 'peer:left': {
            const peerId = msg['peerId'] as string;
            pcsRef.current.get(peerId)?.close();
            pcsRef.current.delete(peerId);
            s.removePeer(peerId);
            debugBus.emit('media', 'peer:left', { peerId });
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
        }
      };
    }

    init().catch((e) => useCallStore.getState().setError(String(e)));

    return () => {
      disposed = true;
      wsRef.current?.close();
      pcsRef.current.forEach((pc) => pc.close());
      pcsRef.current.clear();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Retorna apenas o que é necessário externamente (ws para o useChat)
  return { ws: store.ws };
}
