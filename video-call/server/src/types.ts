import type { WebSocket } from 'ws';

export type PeerId = string;
export type RoomId = string;

export interface Peer {
  id: PeerId;
  ws: WebSocket;
  role?: string;
}

export interface Room {
  id: RoomId;
  peers: Map<PeerId, Peer>;
  createdAt: number;
}

export type WsMessage =
  | { type: 'join'; roomId: RoomId; peerId: PeerId; role?: string }
  | { type: 'leave'; roomId: RoomId; peerId: PeerId }
  | { type: 'offer'; to: PeerId; from: PeerId; sdp: unknown }
  | { type: 'answer'; to: PeerId; from: PeerId; sdp: unknown }
  | { type: 'ice-candidate'; to: PeerId; from: PeerId; candidate: unknown }
  | { type: 'chat:message'; roomId: RoomId; from: PeerId; text: string; ts: number }
  | { type: 'peers:list'; peers: Array<{ id: PeerId; role?: string }> }
  | { type: 'peer:joined'; peer: { id: PeerId; role?: string } }
  | { type: 'peer:left'; peerId: PeerId }
  | { type: 'media:state'; from: PeerId; cameraOn: boolean; micOn: boolean }
  | { type: 'debug:event'; origin: string; category: string; info: string; details?: Record<string, unknown> | null }
  | { type: 'debug:subscribe' }
  | { type: 'debug:unsubscribe' }
  | { type: 'debug:broadcast'; event: DebugEventDto }
  | { type: 'debug:history'; events: DebugEventDto[] }
  | { type: 'debug:clear' }
  | { type: 'reconnect'; roomId: RoomId; peerId: PeerId; role?: string };

export interface DebugEventDto {
  id: string;
  ts: number;
  roomId: string;
  peerId: string;
  role: string;
  origin: string;
  category: string;
  info: string;
  details: Record<string, unknown> | null;
}
