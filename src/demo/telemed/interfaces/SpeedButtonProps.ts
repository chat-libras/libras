import type { LibrasTranslatorApi } from '../../libras';

// Props do botão de velocidade do avatar.
export interface SpeedButtonProps {
  status: LibrasTranslatorApi['status'];
  speed: number;
  onSetSpeed: LibrasTranslatorApi['setSpeed'];
}
