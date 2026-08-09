import type { ParticipantRole } from '../../domain/types/index.ts';

export interface CallLinkModel {
  id: string;
  roomId: string;
  name: string;
  role: ParticipantRole;
  document: string | null;
  accessUrl: string;
  createdAt: string;
  usedAt: string | null;
  expiresAt: string | null;
}

export interface CreateCallLinkInput {
  roomId: string;
  name: string;
  role: ParticipantRole;
  document?: string | null;
  expiresAt?: string | null;
}
