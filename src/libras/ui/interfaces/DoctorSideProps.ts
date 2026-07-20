import type { AudioSource, ASROptions } from '../../core/asr/phrase-source';
import type { LibrasChatMessage, LibrasChatRole } from './LibrasChatProps';

export interface DoctorSideProps {
  messages: LibrasChatMessage[];
  onSend: (text: string) => void;
  labels: Record<LibrasChatRole, string>;
  audio: AudioSource;
  asr: ASROptions;
}
