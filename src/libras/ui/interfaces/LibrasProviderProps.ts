import type { VLibrasLoaderOptions } from '../../core/vlibras-loader';
import type { AudioSource, ASROptions } from '../../core/asr/phrase-source';
import type { LibrasStrings } from '../utils/strings';

export interface A11yOptions {
  /** aria-label do container do avatar. Default: "Avatar de Libras". */
  avatarLabel?: string;
  /** Respeita prefers-reduced-motion desativando animações de loading. Default: true. */
  respectReducedMotion?: boolean;
}

/** Configuração global passada ao `<LibrasProvider>`. Herdada por todos os componentes filhos. */
export interface LibrasConfig {
  /** Opções padrão do player VLibras (avatar, URL do bundle, endpoint de tradução). */
  vlibras?: VLibrasLoaderOptions;
  /** Motor de ASR padrão para componentes que capturam áudio. */
  asr?: ASROptions;
  /** Fonte de áudio padrão. */
  audio?: AudioSource;
  /** Textos da UI padrão (i18n/rebranding). */
  strings?: LibrasStrings;
  /** Opções de acessibilidade padrão. */
  a11y?: A11yOptions;
}
