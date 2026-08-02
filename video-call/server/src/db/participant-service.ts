import { randomUUID } from 'crypto';
import { AppDataSource } from './data-source.ts';
import { Participant, ParticipantStatus } from './entities/Participant.ts';

const repo = () => AppDataSource.getRepository(Participant);

export interface CreateParticipantInput {
  id?: string;
  roomId: string;
  role: string;
  accessUrl?: string;
  sessionId?: string;
}

export async function createParticipant(input: CreateParticipantInput): Promise<Participant> {
  const p = repo().create({
    id: input.id ?? randomUUID(),
    roomId: input.roomId,
    role: input.role,
    accessUrl: input.accessUrl ?? null,
    sessionId: input.sessionId ?? null,
    status: 'not_started',
    joinedAt: null,
    lastActiveAt: null,
    leftAt: null,
    reconnectCount: 0,
  });
  return repo().save(p);
}

/**
 * Cria participante se não existir (join via WS).
 * Vincula à sessão da sala e transiciona status para active.
 */
export async function joinParticipant(opts: {
  id: string;
  roomId: string;
  role: string;
  sessionId: string;
}): Promise<Participant> {
  const existing = await repo().findOneBy({ id: opts.id });
  const now = new Date();

  if (existing) {
    // Reconexão
    existing.sessionId = opts.sessionId;
    existing.lastActiveAt = now;
    existing.reconnectCount = existing.status !== 'not_started' ? existing.reconnectCount + 1 : existing.reconnectCount;
    existing.status = existing.reconnectCount > 0 ? 'reconnected' : 'active';
    if (!existing.joinedAt) existing.joinedAt = now;
    return repo().save(existing);
  }

  const p = repo().create({
    id: opts.id,
    roomId: opts.roomId,
    role: opts.role,
    sessionId: opts.sessionId,
    accessUrl: null,
    status: 'active',
    joinedAt: now,
    lastActiveAt: now,
    leftAt: null,
    reconnectCount: 0,
  });
  return repo().save(p);
}

export async function getParticipant(id: string): Promise<Participant | null> {
  return repo().findOneBy({ id });
}

export async function getParticipantsByRoom(roomId: string): Promise<Participant[]> {
  return repo().findBy({ roomId });
}

export async function setParticipantStatus(
  id: string,
  status: ParticipantStatus,
): Promise<Participant | null> {
  const p = await repo().findOneBy({ id });
  if (!p) return null;

  const now = new Date();
  p.status = status;

  if ((status === 'active' || status === 'reconnected') && !p.joinedAt) p.joinedAt = now;
  if (status === 'active' || status === 'reconnected') p.lastActiveAt = now;
  if (status === 'reconnected') p.reconnectCount += 1;
  if (status === 'left' || status === 'disconnected') p.leftAt = now;

  return repo().save(p);
}

export async function updateParticipantUrl(id: string, accessUrl: string): Promise<void> {
  await repo().update(id, { accessUrl });
}
