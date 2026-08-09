import { randomUUID } from 'crypto';
import { AppDataSource } from './data-source.ts';
import { LogEvent } from './entities/LogEvent.ts';

// ── LogEvent ─────────────────────────────────────────────────────────────────

export async function saveLogEvent(opts: {
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
    origin: opts.origin,
    category: opts.category,
    info: opts.info,
    details: {
      peerId: opts.peerId,
      role: opts.role,
      ...(opts.details ?? {}),
    },
  });
  await repo.save(event);
  return event;
}

/** Busca logs de uma sala via join com participants */
export async function getLogEvents(roomId: string, since?: number): Promise<LogEvent[]> {
  const repo = AppDataSource.getRepository(LogEvent);
  const qb = repo
    .createQueryBuilder('e')
    .innerJoin('participants', 'p', 'p.id = e.participantId AND p.roomId = :roomId', { roomId });
  if (since) qb.andWhere('e.ts > :since', { since: new Date(since) });
  return qb.orderBy('e.ts', 'ASC').getMany();
}
