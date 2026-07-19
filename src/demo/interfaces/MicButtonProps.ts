import type { LibrasTranslatorApi } from '../../libras';

// Props do botão de microfone (liga/desliga a escuta).
export interface MicButtonProps {
  status: LibrasTranslatorApi['status'];
  listening: boolean;
  onStart: LibrasTranslatorApi['start'];
  onStop: LibrasTranslatorApi['stop'];
}
