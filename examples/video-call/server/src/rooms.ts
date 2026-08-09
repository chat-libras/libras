import type { Room, RoomId, Peer, PeerId } from './types.ts';

const rooms = new Map<RoomId, Room>();

export function getOrCreateRoom(roomId: RoomId): Room {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { id: roomId, peers: new Map(), createdAt: Date.now() });
  }
  return rooms.get(roomId)!;
}

export function getRoomInfo(roomId: RoomId): Room | undefined {
  return rooms.get(roomId);
}

export function addPeer(room: Room, peer: Peer): void {
  room.peers.set(peer.id, peer);
}

export function removePeer(room: Room, peerId: PeerId): void {
  room.peers.delete(peerId);
  if (room.peers.size === 0) rooms.delete(room.id);
}

export function getPeers(room: Room): Peer[] {
  return [...room.peers.values()];
}
