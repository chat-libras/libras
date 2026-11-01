import type { VLibrasLoaderOptions } from '../../core/vlibras-loader';
import type { AudioSource, ASROptions } from '../../core/asr/phrase-source';
import type { LibrasStrings } from '../utils/strings';

export interface A11yOptions {
  /** aria-label do container do avatar. Default: "Avatar de Libras". */
  avatarLabel?: string;
  /** Respeita prefers-reduced-motion desativando animações de loading. Default: true. */
  respectReducedMotion?: boolean;
}

export interface LibrasConfig {
  vlibras?: VLibrasLoaderOptions;
  asr?: ASROptions;
  audio?: AudioSource;
  strings?: LibrasStrings;
  a11y?: A11yOptions;
}
