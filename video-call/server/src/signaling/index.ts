import { WebSocket } from 'ws';
import { randomUUID } from 'crypto';
import { getOrCreateRoom, addPeer, removePeer, getPeers } from '../rooms.ts';
import { broadcastChatMessage } from '../chat/index.ts';
import { saveLogEvent, getLogEvents, getOrCreateSession, closeRoomSession } from '../db/log-service.ts';
import { joinParticipant, setParticipantStatus } from '../db/participant-service.ts';
import type { WsMessage, Peer, Room } from '../types.ts';

// ── Helpers ──────────────────────────────────────────────────────────────────

function send(ws: WebSocket, msg: WsMessage): void {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
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

// ── Debug subscribers por sala ───────────────────────────────────────────────
// roomId → Set de WebSockets que querem receber broadcasts de debug desta sala

const roomDebugSubscribers = new Map<string, Set<WebSocket>>();

function getRoomSubs(roomId: string): Set<WebSocket> {
  if (!roomDebugSubscribers.has(roomId)) roomDebugSubscribers.set(roomId, new Set());
  return roomDebugSubscribers.get(roomId)!;
}

function addDebugSubscriber(roomId: string, ws: WebSocket): void {
  getRoomSubs(roomId).add(ws);
}

function removeDebugSubscriber(ws: WebSocket): void {
  for (const subs of roomDebugSubscribers.values()) subs.delete(ws);
}

async function broadcastDebugEvent(opts: {
  roomId: string; peerId: string; role: string;
  origin: string; category: string; info: string;
  details?: Record<string, unknown> | null;
}): Promise<void> {
  const event = await saveLogEvent(opts);
  const dto: WsMessage = {
    type: 'debug:broadcast',
    event: {
      id: event.id,
      ts: event.ts.getTime(),
      roomId: event.roomId,
      peerId: event.peerId,
      role: event.role,
      origin: event.origin,
      category: event.category,
      info: event.info,
      details: event.details,
    },
  };
  for (const sub of getRoomSubs(opts.roomId)) {
    if (sub.readyState === WebSocket.OPEN) send(sub, dto);
  }
}

async function sendHistory(ws: WebSocket, roomId: string): Promise<void> {
  const events = await getLogEvents(roomId);
  send(ws, {
    type: 'debug:history',
    events: events.map((e) => ({
      id: e.id,
      ts: e.ts.getTime(),
      roomId: e.roomId,
      peerId: e.peerId,
      role: e.role,
      origin: e.origin,
      category: e.category,
      info: e.info,
      details: e.details,
    })),
  });
}

// ── Connection handler ────────────────────────────────────────────────────────

export function handleWsConnection(ws: WebSocket): void {
  let peer: Peer | null = null;
  let currentRoom: Room | null = null;
  // debug:subscribe pode chegar antes do join (enviado no onopen)
  let pendingSubscribe = false;

  ws.on('message', (raw) => { void handleMessage(raw.toString()); });

  async function handleJoin(roomId: string, peerId: string, role: string | undefined, isReconnect: boolean): Promise<void> {
    const room = getOrCreateRoom(roomId);
    peer = { id: peerId, ws, role };
    currentRoom = room;

    const existingPeers = getPeers(room).map((p) => ({ id: p.id, role: p.role }));
    send(ws, { type: 'peers:list', peers: existingPeers });

    addPeer(room, peer);
    broadcast(room, { type: 'peer:joined', peer: { id: peer.id, role: peer.role } }, peer.id);
    console.log(`[signaling] ${peer.id} (${peer.role ?? 'anon'}) ${isReconnect ? 'reconectou em' : 'entrou em'} "${room.id}" — ${room.peers.size} peer(s)`);

    const session = await getOrCreateSession(room.id);
    await joinParticipant({ id: peer.id, roomId: room.id, role: peer.role ?? 'unknown', sessionId: session.id });

    // Registra evento de reconnect no banco para auditoria
    if (isReconnect) {
      await broadcastDebugEvent({
        roomId: room.id,
        peerId: peer.id,
        role: peer.role ?? 'unknown',
        origin: 'client',
        category: 'socket',
        info: 'peer:reconnected',
        details: { peerId: peer.id, role: peer.role },
      });
    }

    if (pendingSubscribe) {
      pendingSubscribe = false;
      addDebugSubscriber(room.id, ws);
      await sendHistory(ws, room.id);
    }
  }

  async function handleMessage(rawStr: string): Promise<void> {
    let msg: WsMessage;
    try {
      msg = JSON.parse(rawStr) as WsMessage;
    } catch {
      return;
    }

    switch (msg.type) {

      case 'join': {
        await handleJoin(msg.roomId, msg.peerId ?? randomUUID(), msg.role, false);
        break;
      }

      case 'reconnect': {
        await handleJoin(msg.roomId, msg.peerId ?? randomUUID(), msg.role, true);
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
        broadcast(currentRoom, {
          type: 'media:state',
          from: peer.id,
          cameraOn: msg.cameraOn,
          micOn: msg.micOn,
        }, peer.id);
        break;
      }

      case 'debug:event': {
        if (!currentRoom || !peer) return;
        await broadcastDebugEvent({
          roomId: currentRoom.id,
          peerId: peer.id,
          role: peer.role ?? 'unknown',
          origin: msg.origin ?? 'client',
          category: msg.category,
          info: msg.info,
          details: msg.details ?? null,
        });
        break;
      }

      case 'debug:subscribe': {
        if (!currentRoom) {
          pendingSubscribe = true;
          return;
        }
        addDebugSubscriber(currentRoom.id, ws);
        await sendHistory(ws, currentRoom.id);
        break;
      }

      case 'debug:unsubscribe': {
        removeDebugSubscriber(ws);
        pendingSubscribe = false;
        break;
      }

      case 'debug:clear': {
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
    removeDebugSubscriber(ws);
    void handleLeave();
  });
  ws.on('error', (err) => console.error('[ws] erro:', err.message));

  async function handleLeave(): Promise<void> {
    if (!peer || !currentRoom) return;
    const leavingPeer = peer;
    const room = currentRoom;

    removePeer(room, leavingPeer.id);
    broadcast(room, { type: 'peer:left', peerId: leavingPeer.id }, leavingPeer.id);
    await setParticipantStatus(leavingPeer.id, 'left');
    console.log(`[signaling] ${leavingPeer.id} saiu de "${room.id}"`);

    // Fecha a sessão da sala quando ela esvazia
    if (room.peers.size === 0) {
      await closeRoomSession(room.id);
      console.log(`[signaling] sala "${room.id}" vazia — sessão fechada`);
    }

    peer = null;
    currentRoom = null;
  }
}
