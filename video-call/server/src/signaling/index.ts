import { WebSocket } from 'ws';
import { randomUUID } from 'crypto';
import { getOrCreateRoom, addPeer, removePeer, getPeers } from '../rooms.ts';
import { broadcastChatMessage } from '../chat/index.ts';
import { saveLogEvent, getLogEvents, createSession, closeSession } from '../db/log-service.ts';
import type { WsMessage, Peer, Room } from '../types.ts';

function send(ws: WebSocket, msg: WsMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

function broadcast(room: Room, msg: WsMessage, excludePeerId?: string): void {
  for (const peer of getPeers(room)) {
    if (peer.id !== excludePeerId) send(peer.ws, msg);
  }
}

function relay(room: Room, msg: WsMessage & { to: string }): void {
  const target = room.peers.get(msg.to);
  if (target) send(target.ws, msg);
}

// Subscribers de debug — guardado por WS, independente do join
const debugSubscribers = new Set<WebSocket>();

async function broadcastDebugEvent(opts: {
  roomId: string; peerId: string; role: string;
  category: string; eventType: string; payload: Record<string, unknown>;
}): Promise<void> {
  const event = await saveLogEvent(opts);
  const msg: WsMessage = { type: 'debug:broadcast', event: {
    id: event.id,
    ts: event.ts.getTime(),
    roomId: event.roomId,
    peerId: event.peerId,
    role: event.role,
    category: event.category,
    type: event.eventType,
    payload: event.payload,
  }};
  for (const sub of debugSubscribers) {
    if (sub.readyState === WebSocket.OPEN) send(sub, msg);
  }
}

export function handleWsConnection(ws: WebSocket): void {
  let peer: Peer | null = null;
  let currentRoom: Room | null = null;

  ws.on('message', (raw) => {
    void handleMessage(raw.toString());
  });

  async function handleMessage(rawStr: string): Promise<void> {
    let msg: WsMessage;
    try {
      msg = JSON.parse(rawStr) as WsMessage;
    } catch {
      return;
    }

    switch (msg.type) {
      case 'join': {
        const room = getOrCreateRoom(msg.roomId);
        peer = { id: msg.peerId ?? randomUUID(), ws, role: msg.role };
        currentRoom = room;

        const existingPeers = getPeers(room).map((p) => ({ id: p.id, role: p.role }));
        send(ws, { type: 'peers:list', peers: existingPeers });

        addPeer(room, peer);
        broadcast(room, { type: 'peer:joined', peer: { id: peer.id, role: peer.role } }, peer.id);
        console.log(`[signaling] ${peer.id} (${peer.role ?? 'anon'}) entrou em "${room.id}" — ${room.peers.size} peer(s)`);

        // Persiste sessão
        await createSession(room.id, peer.id, peer.role);

        // Se já estava subscrito, envia histórico
        if (debugSubscribers.has(ws)) {
          const events = await getLogEvents(room.id);
          send(ws, { type: 'debug:history', events: events.map((e) => ({
            id: e.id, ts: e.ts.getTime(), roomId: e.roomId,
            peerId: e.peerId, role: e.role, category: e.category,
            type: e.eventType, payload: e.payload,
          }))});
        }
        break;
      }

      case 'offer':
      case 'answer':
      case 'ice-candidate': {
        if (!currentRoom) return;
        relay(currentRoom, msg as WsMessage & { to: string });
        break;
      }

      case 'chat:message': {
        if (!currentRoom || !peer) return;
        broadcastChatMessage(currentRoom, peer.id, msg.text);
        break;
      }

      case 'media:state': {
        if (!currentRoom || !peer) return;
        broadcast(currentRoom, { type: 'media:state', from: peer.id, cameraOn: msg.cameraOn, micOn: msg.micOn }, peer.id);
        break;
      }

      case 'debug:event': {
        if (!currentRoom || !peer) return;
        await broadcastDebugEvent({
          roomId: currentRoom.id,
          peerId: peer.id,
          role: peer.role ?? 'unknown',
          category: msg.category,
          eventType: msg.eventType,
          payload: msg.payload,
        });
        break;
      }

      case 'debug:subscribe': {
        debugSubscribers.add(ws);
        if (currentRoom) {
          const events = await getLogEvents(currentRoom.id);
          send(ws, { type: 'debug:history', events: events.map((e) => ({
            id: e.id, ts: e.ts.getTime(), roomId: e.roomId,
            peerId: e.peerId, role: e.role, category: e.category,
            type: e.eventType, payload: e.payload,
          }))});
        }
        break;
      }

      case 'debug:unsubscribe': {
        debugSubscribers.delete(ws);
        break;
      }

      case 'debug:clear': {
        // Não deletamos do banco — apenas notifica subscribers com lista vazia
        // para limpar a view. Dados persistem para auditoria.
        send(ws, { type: 'debug:history', events: [] });
        break;
      }

      case 'leave': {
        await handleLeave();
        break;
      }
    }
  }

  ws.on('close', () => {
    debugSubscribers.delete(ws);
    void handleLeave();
  });
  ws.on('error', (err) => console.error('[ws] erro:', err.message));

  async function handleLeave(): Promise<void> {
    if (!peer || !currentRoom) return;
    removePeer(currentRoom, peer.id);
    broadcast(currentRoom, { type: 'peer:left', peerId: peer.id });
    await closeSession(peer.id);
    console.log(`[signaling] ${peer.id} saiu`);
    peer = null;
    currentRoom = null;
  }
}
