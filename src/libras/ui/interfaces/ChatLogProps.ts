import type { CSSProperties } from 'react';
import type { LibrasChatMessage, LibrasChatRole } from './LibrasChatProps';

export interface ChatLogProps {
  messages: LibrasChatMessage[];
  /** Papel desta instância (para alinhar as próprias bolhas à direita). */
  mine: LibrasChatRole;
  labels: Record<LibrasChatRole, string>;
  className?: string;
  style?: CSSProperties;
}
