import type { VLibrasLoaderOptions } from '../../core/vlibras-loader';
import type { LibrasChatMessage, LibrasChatRole } from './LibrasChatProps';

export interface ClientSideProps {
  messages: LibrasChatMessage[];
  onSend: (text: string) => void;
  labels: Record<LibrasChatRole, string>;
  vlibras?: VLibrasLoaderOptions;
  speed: number;
}
