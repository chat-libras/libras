import type { CallParams } from '../../../../domain/types/index.ts';

export interface CallScreenProps {
  params: CallParams;
  onLeave: () => void;
}
