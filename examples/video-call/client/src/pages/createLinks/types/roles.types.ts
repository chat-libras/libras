import type { ParticipantRole } from '../../../domain/types/index.ts';

export const ROLE_LABELS: Record<ParticipantRole, string> = {
  PATIENT: '👤 Paciente',
  HEALTH_PROFESSIONAL: '🩺 Profissional de Saúde',
};
