import { VLibrasLoaderOptions } from '../../core/vlibras-loader';
import { LibrasChatMessage, LibrasChatRole } from './LibrasChatProps';
import { LibrasStrings } from '../utils/strings';
export interface ReceiverSideProps {
    messages: LibrasChatMessage[];
    onSend: (text: string) => void;
    labels: Record<LibrasChatRole, string>;
    vlibras?: VLibrasLoaderOptions;
    speed: number;
    strings: Required<LibrasStrings>;
}
