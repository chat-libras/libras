import type { VLibrasLoaderOptions } from '../../core/vlibras-loader';
import type { AudioSource, ASROptions } from '../../core/asr/phrase-source';
import type { LibrasStrings } from '../consts/strings';

export interface A11yOptions {
  avatarLabel?: string;
  respectReducedMotion?: boolean;
}

export interface LibrasConfig {
  vlibras?: VLibrasLoaderOptions;
  asr?: ASROptions;
  audio?: AudioSource;
  strings?: LibrasStrings;
  a11y?: A11yOptions;
}
