import { WebSocket } from 'ws';
import { getPeers } from '../rooms.ts';
import type { Room, WsMessage } from '../types.ts';

function send(ws: WebSocket, msg: WsMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

export function broadcastChatMessage(room: Room, from: string, text: string): void {
  const msg: WsMessage = {
    type: 'chat:message',
    roomId: room.id,
    from,
    text,
    ts: Date.now(),
  };

  for (const peer of getPeers(room)) {
    send(peer.ws, msg);
  }
}
