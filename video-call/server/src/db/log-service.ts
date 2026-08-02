import { AppDataSource } from './data-source.ts';
import { Session } from './entities/Session.ts';
import { LogEvent } from './entities/LogEvent.ts';

// Mapa peerId → Session (in-memory para a sessão ativa, evita query a cada evento)
const activeSessions = new Map<string, Session>();

export async function createSession(roomId: string, peerId: string, role?: string): Promise<Session> {
  const repo = AppDataSource.getRepository(Session);
  const session = repo.create({ roomId, peerId, role });
  await repo.save(session);
  activeSessions.set(peerId, session);
  return session;
}

export async function closeSession(peerId: string): Promise<void> {
  const session = activeSessions.get(peerId);
  if (!session) return;
  const repo = AppDataSource.getRepository(Session);
  session.leftAt = new Date();
  await repo.save(session);
  activeSessions.delete(peerId);
}

export async function saveLogEvent(opts: {
  roomId: string;
  peerId: string;
  role: string;
  category: string;
  eventType: string;
  payload: Record<string, unknown>;
}): Promise<LogEvent> {
  const session = activeSessions.get(opts.peerId);
  const repo = AppDataSource.getRepository(LogEvent);
  const event = repo.create({
    session: session ?? undefined,
    roomId: opts.roomId,
    peerId: opts.peerId,
    role: opts.role,
    category: opts.category,
    eventType: opts.eventType,
    payload: opts.payload,
  });
  await repo.save(event);
  return event;
}

export async function getLogEvents(roomId: string, since?: number): Promise<LogEvent[]> {
  const repo = AppDataSource.getRepository(LogEvent);
  const qb = repo.createQueryBuilder('e')
    .where('e.roomId = :roomId', { roomId });
  if (since) {
    qb.andWhere('e.ts > :since', { since: new Date(since) });
  }
  return qb.orderBy('e.ts', 'ASC').getMany();
}
