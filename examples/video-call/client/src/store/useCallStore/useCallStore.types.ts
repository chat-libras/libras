export interface PeerInfo {
  id: string;
  role?: string;
}

export interface PeerMediaState {
  cameraOn: boolean;
  micOn: boolean;
}

export interface CallState {
  // ── Infra ──────────────────────────────────────────────────────────────────
  ws: WebSocket | null;
  connected: boolean;
  error: string | null;
  peerId: string;
  roomId: string;
  role: string;

  // ── Streams ────────────────────────────────────────────────────────────────
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;

  // ── Peers ──────────────────────────────────────────────────────────────────
  peers: PeerInfo[];
  peerMediaState: Map<string, PeerMediaState>;

  // ── Actions — infra ────────────────────────────────────────────────────────
  setWs: (ws: WebSocket | null) => void;
  setConnected: (v: boolean) => void;
  setError: (v: string | null) => void;
  setLocalStream: (s: MediaStream | null) => void;
  setRemoteStream: (peerId: string, stream: MediaStream) => void;
  removeRemoteStream: (peerId: string) => void;

  // ── Actions — peers ────────────────────────────────────────────────────────
  setPeers: (peers: PeerInfo[]) => void;
  addPeer: (peer: PeerInfo) => void;
  removePeer: (peerId: string) => void;
  setPeerMediaState: (peerId: string, state: PeerMediaState) => void;
}
