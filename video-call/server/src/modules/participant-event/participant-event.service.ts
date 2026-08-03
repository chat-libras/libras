import { randomUUID } from 'crypto';
import { AppDataSource } from '../../db/data-source.ts';
import { ParticipantEvent, ParticipantEventType } from './participant-event.entity.ts';

// ── Repository ────────────────────────────────────────────────────────────────

function repo() {
  return AppDataSource.getRepository(ParticipantEvent);
}

// ── Service ───────────────────────────────────────────────────────────────────

export async function recordParticipantEvent(opts: {
  participantId: string;
  roomId: string;
  type: ParticipantEventType;
}): Promise<ParticipantEvent> {
  const event = repo().create({
    id: randomUUID(),
    participantId: opts.participantId,
    roomId: opts.roomId,
    type: opts.type,
  });
  return repo().save(event);
}

export async function getEventsByRoom(roomId: string): Promise<ParticipantEvent[]> {
  return repo()
    .createQueryBuilder('e')
    .where('e.roomId = :roomId', { roomId })
    .orderBy('e.ts', 'ASC')
    .getMany();
}

export async function getEventsByParticipant(participantId: string): Promise<ParticipantEvent[]> {
  return repo()
    .createQueryBuilder('e')
    .where('e.participantId = :participantId', { participantId })
    .orderBy('e.ts', 'ASC')
    .getMany();
}
