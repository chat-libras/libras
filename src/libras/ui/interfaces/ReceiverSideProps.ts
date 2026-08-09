import type { VLibrasLoaderOptions } from '../../core/vlibras-loader';
import type { LibrasChatMessage, LibrasChatRole } from './LibrasChatProps';
import type { LibrasStrings } from '../strings';

export interface ReceiverSideProps {
  messages: LibrasChatMessage[];
  onSend: (text: string) => void;
  labels: Record<LibrasChatRole, string>;
  vlibras?: VLibrasLoaderOptions;
  speed: number;
  strings: Required<LibrasStrings>;
}
