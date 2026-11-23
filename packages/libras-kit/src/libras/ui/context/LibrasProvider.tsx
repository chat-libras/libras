import { useContext, useRef } from 'react';
import type { VLibrasSignRenderer } from '../../core/vlibras-renderer';
import type { LibrasConfig } from '../interfaces/LibrasProvider';
import { LibrasContext, LibrasRendererContext } from './LibrasContext';

export type { LibrasConfig, A11yOptions } from '../interfaces/LibrasProvider';

/**
 * Provider opcional que define defaults globais para todos os componentes e hooks
 * da lib descendentes. Útil para evitar prop drilling quando múltiplos componentes
 * compartilham a mesma configuração de VLibras, ASR ou strings.
 *
 * @example
 * <LibrasProvider config={{ vlibras: { avatar: 'hozana' }, strings: { chatSendButton: 'Send' } }}>
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
  // Cada LibrasProvider cria seu próprio rendererRef isolado, permitindo
  // múltiplos avatares independentes em subárvores distintas.
  const rendererRef = useRef<VLibrasSignRenderer | null>(null);

  return (
    <LibrasContext.Provider value={config}>
      <LibrasRendererContext.Provider value={rendererRef}>
        {children}
      </LibrasRendererContext.Provider>
    </LibrasContext.Provider>
  );
}

/** Lê a configuração global do LibrasProvider mais próximo (ou {} se não houver). */
export function useLibrasConfig(): LibrasConfig {
  return useContext(LibrasContext);
}

/** Lê o ref do renderer do contexto mais próximo (ou o global singleton se não houver provider). */
export function useLibrasRendererRef(): React.MutableRefObject<VLibrasSignRenderer | null> {
  return useContext(LibrasRendererContext);
}
