import { WebSocket } from 'ws';
import { randomUUID } from 'crypto';
import { getOrCreateRoom, addPeer, removePeer, getPeers } from '../rooms.ts';
import { broadcastChatMessage } from '../chat/index.ts';
import { saveLogEvent, getLogEvents } from '../db/log-service.ts';
import { joinParticipant, setParticipantStatus } from '../modules/participant/participant.service.ts';
import { recordParticipantEvent } from '../modules/participant-event/participant-event.service.ts';
import { closeRoom, getOrCreateRoom as getOrCreateDbRoom, setStartedByIfEmpty } from '../modules/room/room.service.ts';
import type { ParticipantRole } from '../modules/participant/participant.entity.ts';
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

// ── Helpers ───────────────────────────────────────────────────────────────────

const VALID_ROLES: ParticipantRole[] = ['PATIENT', 'HEALTH_PROFESSIONAL'];
function toParticipantRole(role: string | undefined): ParticipantRole {
  if (role && (VALID_ROLES as string[]).includes(role)) return role as ParticipantRole;
  return 'PATIENT';
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

/** Retorna true se o WS já era subscriber desta sala antes de ser adicionado */
function addedAsSubscriber(roomId: string, ws: WebSocket): boolean {
  return getRoomSubs(roomId).has(ws);
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
      roomId: opts.roomId,
      peerId: opts.peerId,
      role: opts.role,
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
      roomId,
      peerId: (e.details as Record<string, unknown> | null)?.['peerId'] as string ?? e.participantId ?? '',
      role: (e.details as Record<string, unknown> | null)?.['role'] as string ?? 'unknown',
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

    // Garante que a sala existe no banco, cria com mesmo id se necessário
    const dbRoom = await getOrCreateDbRoom(roomId);

    await joinParticipant({
      id: peer.id,
      roomId: dbRoom.id,
      role: toParticipantRole(peer.role),
    });

    await recordParticipantEvent({
      participantId: peer.id,
      roomId: dbRoom.id,
      type: isReconnect ? 'RECONNECTED' : 'CONNECTED',
    });

    // Marca o primeiro participante como quem iniciou a sala
    if (!isReconnect) await setStartedByIfEmpty(dbRoom.id, peer.id);

    // Persiste evento de debug
    await broadcastDebugEvent({
      roomId: room.id,
      peerId: peer.id,
      role: peer.role ?? 'unknown',
      origin: 'server',
      category: 'system',
      info: isReconnect ? 'peer:reconnected' : 'peer:connected',
      details: { peerId: peer.id, role: peer.role ?? 'unknown' },
    });

    // Sempre envia histórico completo ao entrar/reconectar (pendente ou subscriber já registrado)
    if (pendingSubscribe || addedAsSubscriber(room.id, ws)) {
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
        if (msg.to) {
          const target = currentRoom.peers.get(msg.to);
          if (target?.ws.readyState === WebSocket.OPEN) {
            target.ws.send(JSON.stringify({ type: 'media:state' as const, from: peer.id, cameraOn: msg.cameraOn, micOn: msg.micOn }));
          }
        } else {
          broadcast(currentRoom, { type: 'media:state', from: peer.id, cameraOn: msg.cameraOn, micOn: msg.micOn }, peer.id);
        }
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
        await handleLeave('LEFT');
        break;
      }
    }
  }

  ws.on('close', () => {
    removeDebugSubscriber(ws);
    void handleLeave('DISCONNECTED');
  });
  ws.on('error', (err) => console.error('[ws] erro:', err.message));

  async function handleLeave(reason: 'LEFT' | 'DISCONNECTED' = 'LEFT'): Promise<void> {
    if (!peer || !currentRoom) return;
    const leavingPeer = peer;
    const room = currentRoom;

    removePeer(room, leavingPeer.id);
    broadcast(room, { type: 'peer:left', peerId: leavingPeer.id }, leavingPeer.id);
    await setParticipantStatus(leavingPeer.id, reason);
    await recordParticipantEvent({ participantId: leavingPeer.id, roomId: room.id, type: reason });
    console.log(`[signaling] ${leavingPeer.id} saiu de "${room.id}" (${reason})`);

    await broadcastDebugEvent({
      roomId: room.id,
      peerId: leavingPeer.id,
      role: leavingPeer.role ?? 'unknown',
      origin: 'server',
      category: 'system',
      info: reason === 'DISCONNECTED' ? 'peer:disconnected' : 'peer:left',
      details: { peerId: leavingPeer.id, role: leavingPeer.role ?? 'unknown', reason },
    });

    // Fecha a sala no banco quando esvazia
    if (room.peers.size === 0) {
      await closeRoom(room.id);
      console.log(`[signaling] sala "${room.id}" vazia — fechada`);
    }

    peer = null;
    currentRoom = null;
  }
}
