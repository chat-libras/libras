import { z } from 'zod/v4';
import { randomUUID } from 'crypto';
import { AppDataSource } from '../../db/data-source.ts';
import { Room } from './room.entity.ts';

// ── Schemas ───────────────────────────────────────────────────────────────────

export const CreateRoomSchema = z.object({});

// ── Repository ────────────────────────────────────────────────────────────────

function repo() {
  return AppDataSource.getRepository(Room);
}

// ── Service ───────────────────────────────────────────────────────────────────

export async function createRoom(id?: string): Promise<Room> {
  const room = repo().create({ id: id ?? randomUUID(), closedAt: null });
  return repo().save(room);
}

export async function getOrCreateRoom(id: string): Promise<Room> {
  const existing = await repo().findOneBy({ id });
  if (existing) return existing;
  return createRoom(id);
}

/** Define o primeiro participante a conectar como criador da sala, se ainda não estiver definido. */
export async function setStartedByIfEmpty(roomId: string, participantId: string): Promise<void> {
  await repo()
    .createQueryBuilder()
    .update(Room)
    .set({ startedById: participantId })
    .where('id = :roomId AND startedById IS NULL', { roomId })
    .execute();
}

export async function findRoomById(id: string): Promise<Room | null> {
  return repo().findOneBy({ id });
}

export async function closeRoom(id: string): Promise<void> {
  await repo().update(id, { closedAt: new Date() });
}

export async function listRooms(): Promise<Room[]> {
  return repo().find({ order: { createdAt: 'DESC' } });
}
