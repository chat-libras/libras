/**
 * useCallStore — Zustand store centralizado para estado da chamada.
 *
 * Estado local (meu):   cameraOn, micOn, audioOn, librasOn
 * Estado remoto (peers): peerMediaState (Map peerId → {cameraOn,micOn})
 * Infra:                 peers, connected, error, ws, localStream, remoteStreams
 *
 * Subscriber: toda mudança em cameraOn/micOn dispara media:state para o server.
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { debugBus } from '../debug/event-bus.ts';
export interface PeerInfo {
  id: string;
  role?: string;
}

export interface PeerMediaState {
  cameraOn: boolean;
  micOn: boolean;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CallState {
  // Infra
  ws: WebSocket | null;
  connected: boolean;
  error: string | null;
  peerId: string;
  roomId: string;
  role: string;

  // Streams
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;

  // Peers
  peers: PeerInfo[];
  peerMediaState: Map<string, PeerMediaState>;

  // Meu estado de mídia
  cameraOn: boolean;
  micOn: boolean;
  audioOn: boolean;
  librasOn: boolean;

  // Actions — infra
  setWs: (ws: WebSocket | null) => void;
  setConnected: (v: boolean) => void;
  setError: (v: string | null) => void;
  setLocalStream: (s: MediaStream | null) => void;
  setRemoteStream: (peerId: string, stream: MediaStream) => void;
  removeRemoteStream: (peerId: string) => void;

  // Actions — peers
  setPeers: (peers: PeerInfo[]) => void;
  addPeer: (peer: PeerInfo) => void;
  removePeer: (peerId: string) => void;
  setPeerMediaState: (peerId: string, state: PeerMediaState) => void;
  initPeerMediaStates: (peers: PeerInfo[]) => void;

  // Actions — meu estado (disparam subscriber → WS)
  toggleCamera: () => void;
  toggleMic: () => void;
  toggleAudio: () => void;
  toggleLibras: () => void;

  // Usado pelo useWebRTC para passar refs de stream/peerId
  _localStreamRef: React.MutableRefObject<MediaStream | null> | null;
  setLocalStreamRef: (ref: React.MutableRefObject<MediaStream | null>) => void;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useCallStore = create<CallState>()(
  subscribeWithSelector((set, get) => ({
    // Infra
    ws: null,
    connected: false,
    error: null,
    peerId: '',
    roomId: '',
    role: '',

    // Streams
    localStream: null,
    remoteStreams: new Map(),

    // Peers
    peers: [],
    peerMediaState: new Map(),

    // Mídia local
    cameraOn: false,
    micOn: false,
    audioOn: false,
    librasOn: false,

    // Refs internas
    _localStreamRef: null,
    setLocalStreamRef: (ref) => set({ _localStreamRef: ref }),

    // Infra
    setWs: (ws) => set({ ws }),
    setConnected: (connected) => set({ connected }),
    setError: (error) => set({ error }),
    setLocalStream: (localStream) => set({ localStream }),
    setRemoteStream: (peerId, stream) =>
      set((s) => ({ remoteStreams: new Map(s.remoteStreams).set(peerId, stream) })),
    removeRemoteStream: (peerId) =>
      set((s) => {
        const m = new Map(s.remoteStreams);
        m.delete(peerId);
        return { remoteStreams: m };
      }),

    // Peers
    setPeers: (peers) => set({ peers }),
    addPeer: (peer) => set((s) => ({ peers: [...s.peers, peer] })),
    removePeer: (peerId) =>
      set((s) => ({
        peers: s.peers.filter((p) => p.id !== peerId),
        peerMediaState: (() => { const m = new Map(s.peerMediaState); m.delete(peerId); return m; })(),
        remoteStreams: (() => { const m = new Map(s.remoteStreams); m.delete(peerId); return m; })(),
      })),
    setPeerMediaState: (peerId, state) =>
      set((s) => ({ peerMediaState: new Map(s.peerMediaState).set(peerId, state) })),
    initPeerMediaStates: (peers) =>
      set({ peerMediaState: new Map(peers.map((p) => [p.id, { cameraOn: false, micOn: false }])) }),

    // Mídia local — as actions atualizam estado; o subscriber envia para o WS
    toggleCamera: () => {
      const { _localStreamRef, cameraOn, micOn, peerId } = get();
      const stream = _localStreamRef?.current;
      if (!stream) return;
      const next = !cameraOn;
      stream.getVideoTracks().forEach((t) => { t.enabled = next; });
      set({ cameraOn: next });
      debugBus.emit('media', next ? 'camera:on' : 'camera:off', { peerId });
      // subscriber envia media:state (ver setupCallStoreSubscriber)
      void _sendMediaState({ ws: get().ws, peerId, cameraOn: next, micOn });
    },

    toggleMic: () => {
      const { _localStreamRef, cameraOn, micOn, peerId } = get();
      const stream = _localStreamRef?.current;
      if (!stream) return;
      const next = !micOn;
      stream.getAudioTracks().forEach((t) => { t.enabled = next; });
      set({ micOn: next });
      debugBus.emit('media', next ? 'mic:on' : 'mic:off', { peerId });
      void _sendMediaState({ ws: get().ws, peerId, cameraOn, micOn: next });
    },

    toggleAudio: () => {
      const { audioOn } = get();
      const next = !audioOn;
      set({ audioOn: next });
      document.querySelectorAll<HTMLVideoElement>('video[data-remote]').forEach((v) => {
        v.muted = !next;
      });
      debugBus.emit('media', next ? 'remote-audio:on' : 'remote-audio:off', {});
    },

    toggleLibras: () => {
      const { librasOn, role } = get();
      const next = !librasOn;
      set({ librasOn: next });
      debugBus.emit('ui', next ? 'libras:on' : 'libras:off', { role });
      debugBus.emit('ui', next ? 'layout:grid' : 'layout:spotlight', {});
    },
  })),
);

// ── Helper interno ────────────────────────────────────────────────────────────

function _sendMediaState(opts: {
  ws: WebSocket | null;
  peerId: string;
  cameraOn: boolean;
  micOn: boolean;
}) {
  const { ws, peerId, cameraOn, micOn } = opts;
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'media:state', from: peerId, cameraOn, micOn }));
    debugBus.emit('socket', 'media:state', { peerId, cameraOn, micOn });
  }
}

// ── Inicialização do store com params da chamada ──────────────────────────────

export function initCallStore(params: { peerId: string; roomId: string; role: string }) {
  useCallStore.setState({
    peerId: params.peerId,
    roomId: params.roomId,
    role: params.role,
    // reset de chamada anterior
    peers: [],
    peerMediaState: new Map(),
    remoteStreams: new Map(),
    cameraOn: false,
    micOn: false,
    audioOn: false,
    librasOn: false,
    connected: false,
    error: null,
  });
}
