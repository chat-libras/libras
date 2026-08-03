import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { CallState } from './useCallStore.types.ts';
export type { PeerInfo, PeerMediaState, CallState } from './useCallStore.types.ts';

export const useCallStore = create<CallState>()(
  subscribeWithSelector((set) => ({
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

    // ── Infra ────────────────────────────────────────────────────────────────
    setWs: (ws) => set({ ws }),
    setConnected: (connected) => set({ connected }),
    setError: (error) => set({ error }),
    setLocalStream: (localStream) => set({ localStream }),
    setRemoteStream: (peerId, stream) =>
      set((s) => ({ remoteStreams: new Map(s.remoteStreams).set(peerId, stream) })),
    removeRemoteStream: (peerId) =>
      set((s) => {
        const m = new Map(s.remoteStreams); m.delete(peerId); return { remoteStreams: m };
      }),

    // ── Peers ────────────────────────────────────────────────────────────────
    setPeers: (peers) => set({ peers }),
    addPeer: (peer) => set((s) => {
      if (s.peers.some((p) => p.id === peer.id)) return s;
      return { peers: [...s.peers, peer] };
    }),
    removePeer: (peerId) =>
      set((s) => {
        const peers = s.peers.filter((p) => p.id !== peerId);
        const peerMediaState = new Map(s.peerMediaState); peerMediaState.delete(peerId);
        const remoteStreams  = new Map(s.remoteStreams);  remoteStreams.delete(peerId);
        return { peers, peerMediaState, remoteStreams };
      }),
    setPeerMediaState: (peerId, state) =>
      set((s) => ({ peerMediaState: new Map(s.peerMediaState).set(peerId, state) })),
  })),
);

export function initCallStore(params: { peerId: string; roomId: string; role: string }) {
  useCallStore.setState({
    peerId: params.peerId,
    roomId: params.roomId,
    role:   params.role,
    peers: [],
    peerMediaState: new Map(),
    remoteStreams: new Map(),
    connected: false,
    error: null,
  });
}
