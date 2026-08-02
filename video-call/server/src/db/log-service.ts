import { randomUUID } from 'crypto';
import { IsNull } from 'typeorm';
import { AppDataSource } from './data-source.ts';
import { Session } from './entities/Session.ts';
import { LogEvent } from './entities/LogEvent.ts';

// Cache em memória: roomId → Session ativa
const activeSessions = new Map<string, Session>();

// ── Session ──────────────────────────────────────────────────────────────────

/**
 * Retorna a Session ativa para a sala, criando uma nova se não existir.
 * Vários peers da mesma sala compartilham a mesma Session.
 */
export async function getOrCreateSession(roomId: string): Promise<Session> {
  const cached = activeSessions.get(roomId);
  if (cached) return cached;

  const repo = AppDataSource.getRepository(Session);

  // Tenta encontrar sessão ainda aberta no banco (servidor reiniciado, etc.)
  const existing = await repo.findOne({
    where: { roomId, closedAt: IsNull() },
    order: { createdAt: 'DESC' },
  });
  if (existing) {
    activeSessions.set(roomId, existing);
    return existing;
  }

  const session = repo.create({ id: randomUUID(), roomId, closedAt: null });
  await repo.save(session);
  activeSessions.set(roomId, session);
  return session;
}

export async function closeRoomSession(roomId: string): Promise<void> {
  const session = activeSessions.get(roomId);
  if (!session) return;
  const repo = AppDataSource.getRepository(Session);
  session.closedAt = new Date();
  await repo.save(session);
  activeSessions.delete(roomId);
}

// ── LogEvent ─────────────────────────────────────────────────────────────────

export async function saveLogEvent(opts: {
  roomId: string;
  peerId: string;
  role: string;
  origin: string;
  category: string;
  info: string;
  details?: Record<string, unknown> | null;
}): Promise<LogEvent> {
  const repo = AppDataSource.getRepository(LogEvent);
  const event = repo.create({
    id: randomUUID(),
    participantId: opts.peerId,
    roomId: opts.roomId,
    peerId: opts.peerId,
    role: opts.role,
    origin: opts.origin,
    category: opts.category,
    info: opts.info,
    details: opts.details ?? null,
  });
  await repo.save(event);
  return event;
}

export async function getLogEvents(roomId: string, since?: number): Promise<LogEvent[]> {
  const repo = AppDataSource.getRepository(LogEvent);
  const qb = repo.createQueryBuilder('e').where('e.roomId = :roomId', { roomId });
  if (since) qb.andWhere('e.ts > :since', { since: new Date(since) });
  return qb.orderBy('e.ts', 'ASC').getMany();
}
