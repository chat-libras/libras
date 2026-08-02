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
  | { type: 'debug:event'; category: string; eventType: string; payload: Record<string, unknown> }
  | { type: 'debug:subscribe' }
  | { type: 'debug:unsubscribe' }
  | { type: 'debug:broadcast'; event: { id: number; ts: number; roomId: string; peerId: string; role: string; category: string; type: string; payload: Record<string, unknown> } }
  | { type: 'debug:history'; events: Array<{ id: number; ts: number; roomId: string; peerId: string; role: string; category: string; type: string; payload: Record<string, unknown> }> }
  | { type: 'debug:clear' };
