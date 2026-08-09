import { z } from 'zod/v4';
import { randomUUID } from 'crypto';
import { AppDataSource } from '../../db/data-source.ts';
import { Participant, ParticipantStatus } from './participant.entity.ts';

// ── Schemas ───────────────────────────────────────────────────────────────────

export const JoinParticipantSchema = z.object({
  id: z.string().min(1),
  roomId: z.string().min(1),
  role: z.enum(['PATIENT', 'HEALTH_PROFESSIONAL']),
  name: z.string().max(200).nullable().optional(),
  document: z.string().max(50).nullable().optional(),
});

export type JoinParticipantInput = z.infer<typeof JoinParticipantSchema>;

// ── Repository ────────────────────────────────────────────────────────────────

function repo() {
  return AppDataSource.getRepository(Participant);
}

// ── Service ───────────────────────────────────────────────────────────────────

export async function joinParticipant(input: JoinParticipantInput): Promise<Participant> {
  const existing = await repo().findOneBy({ id: input.id });
  const now = new Date();

  if (existing) {
    existing.lastActiveAt = now;
    existing.reconnectCount += 1;
    existing.status = 'RECONNECTED';
    if (!existing.joinedAt) existing.joinedAt = now;
    return repo().save(existing);
  }

  const p = repo().create({
    id: input.id ?? randomUUID(),
    roomId: input.roomId,
    role: input.role,
    name: input.name ?? null,
    document: input.document ?? null,
    status: 'ACTIVE',
    joinedAt: now,
    lastActiveAt: now,
    leftAt: null,
    reconnectCount: 0,
  });
  return repo().save(p);
}

export async function setParticipantStatus(
  id: string,
  status: ParticipantStatus,
): Promise<void> {
  const now = new Date();
  const update: Partial<Participant> = { status };
  if (status === 'LEFT' || status === 'DISCONNECTED') update.leftAt = now;
  if (status === 'ACTIVE' || status === 'RECONNECTED') update.lastActiveAt = now;
  await repo().update(id, update);
}

export async function getParticipantsByRoom(roomId: string): Promise<Participant[]> {
  return repo().findBy({ roomId });
}

export async function getParticipant(id: string): Promise<Participant | null> {
  return repo().findOneBy({ id });
}
