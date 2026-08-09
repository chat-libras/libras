import { z } from 'zod/v4';
import { randomUUID } from 'crypto';
import { AppDataSource } from '../../db/data-source.ts';
import { CallLink } from './call-link.entity.ts';

// ── Schemas ───────────────────────────────────────────────────────────────────

export const CreateCallLinkSchema = z.object({
  roomId: z.string().min(1, 'roomId é obrigatório'),
  name: z.string().min(1, 'name é obrigatório').max(200),
  role: z.enum(['PATIENT', 'HEALTH_PROFESSIONAL']),
  document: z.string().max(50).nullable().optional(),
  expiresAt: z.string().datetime({ offset: true }).nullable().optional(),
});

export type CreateCallLinkInput = z.infer<typeof CreateCallLinkSchema>;

// ── Repository ────────────────────────────────────────────────────────────────

function repo() {
  return AppDataSource.getRepository(CallLink);
}

// ── Service ───────────────────────────────────────────────────────────────────

export async function createCallLink(
  input: CreateCallLinkInput,
  baseUrl: string,
): Promise<CallLink> {
  const id = randomUUID();
  const accessUrl = `${baseUrl}/sala/${input.roomId}/${id}`;

  const link = repo().create({
    id,
    roomId: input.roomId,
    name: input.name,
    role: input.role,
    document: input.document ?? null,
    accessUrl,
    usedAt: null,
    expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
  });

  return repo().save(link);
}

export async function findCallLinkById(id: string): Promise<CallLink | null> {
  return repo().findOneBy({ id });
}

export async function findCallLinksByRoom(roomId: string): Promise<CallLink[]> {
  return repo().findBy({ roomId });
}

export async function markCallLinkUsed(id: string): Promise<void> {
  await repo().update(id, { usedAt: new Date() });
}
