import type { LibrasChatMessage, LibrasChatRole } from 'libras-translator';

export interface ChatParticipantProps {
  role: LibrasChatRole;
  badge: string;
  videoVariant: 'camera' | 'placeholder';
  videoLabel: string;
  videoEmoji: string;
  hint: string;
  messages: LibrasChatMessage[];
  onSend: (text: string) => void;
  labels: Record<LibrasChatRole, string>;
}
