import type { LibrasChatPanelRole } from 'libras-translator';

export interface PanelParticipantProps {
  role: LibrasChatPanelRole;
  badge: string;
  hint: string;
  incomingMessage: string;
  onMessage: (text: string) => void;
  labels: Record<LibrasChatPanelRole, string>;
}
