import type { AudioSource, ASROptions } from '../../core/asr/phrase-source';
import type { LibrasChatMessage, LibrasChatRole } from './LibrasChatProps';
import type { LibrasStrings } from '../strings';

export interface SenderSideProps {
  messages: LibrasChatMessage[];
  onSend: (text: string) => void;
  labels: Record<LibrasChatRole, string>;
  audio: AudioSource;
  asr: ASROptions;
  strings: Required<LibrasStrings>;
}
