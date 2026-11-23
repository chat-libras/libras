import type { LibrasChatRole } from 'libras-kit';

export interface ProviderParticipantProps {
  role: LibrasChatRole;
  badge: string;
  hint: string;
  incomingMessage: string;
  onMessage: (text: string) => void;
  labels: Record<LibrasChatRole, string>;
}
