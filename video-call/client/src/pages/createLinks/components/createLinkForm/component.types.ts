import type { CallLinkModel } from '../../../../modules/call-link/call-link.model.ts';
import type { ParticipantRole } from '../../../../domain/types/index.ts';

export interface CreateLinkFormProps {
  roomId: string;
  role: ParticipantRole;
  onCreated: (link: CallLinkModel) => void;
}
