import { createContext, useContext } from 'react';
import type { VLibrasLoaderOptions } from '../core/vlibras-loader';
import type { AudioSource, ASROptions } from '../core/asr/phrase-source';
import type { LibrasStrings } from './strings';

export interface A11yOptions {
  /** aria-label do container do avatar. Default: "Avatar de Libras". */
  avatarLabel?: string;
  /** Respeita prefers-reduced-motion desativando animações de loading. Default: true. */
  respectReducedMotion?: boolean;
}

/** Configuração global da lib. Props locais nos componentes sobrescrevem estes defaults. */
export interface LibrasConfig {
  vlibras?: VLibrasLoaderOptions;
  asr?: ASROptions;
  audio?: AudioSource;
  strings?: LibrasStrings;
  a11y?: A11yOptions;
}

const LibrasContext = createContext<LibrasConfig>({});

/**
 * Provider opcional que define defaults globais para todos os componentes e hooks
 * da lib descendentes. Útil para evitar prop drilling quando múltiplos componentes
 * compartilham a mesma configuração de VLibras, ASR ou strings.
 *
 * @example
 * <LibrasProvider config={{
 *   vlibras: { avatar: 'hozana' },
 *   strings: { chatSendButton: 'Send' },
 * }}>
 *   <App />
 * </LibrasProvider>
 */
export function LibrasProvider({
  config,
  children,
}: {
  config: LibrasConfig;
  children: React.ReactNode;
}) {
  return <LibrasContext.Provider value={config}>{children}</LibrasContext.Provider>;
}

/** Lê a configuração global do LibrasProvider mais próximo (ou {} se não houver). */
export function useLibrasConfig(): LibrasConfig {
  return useContext(LibrasContext);
}
