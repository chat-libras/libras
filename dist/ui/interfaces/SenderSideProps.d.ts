import { AudioSource, ASROptions } from '../../core/asr/phrase-source';
import { LibrasChatMessage, LibrasChatRole } from './LibrasChatProps';
import { LibrasStrings } from '../utils/strings';
export interface SenderSideProps {
    messages: LibrasChatMessage[];
    onSend: (text: string) => void;
    labels: Record<LibrasChatRole, string>;
    audio: AudioSource;
    asr: ASROptions;
    strings: Required<LibrasStrings>;
}
