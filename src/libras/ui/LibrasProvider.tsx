import { createContext, useContext } from 'react';
import type { LibrasConfig } from './interfaces/LibrasProviderProps';

export type { A11yOptions, LibrasConfig } from './interfaces/LibrasProviderProps';

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
