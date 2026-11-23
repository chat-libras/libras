import { LibrasConfig } from './interfaces/LibrasProviderProps';
export type { A11yOptions, LibrasConfig } from './interfaces/LibrasProviderProps';
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
export declare function LibrasProvider({ config, children, }: {
    config: LibrasConfig;
    children: React.ReactNode;
}): import("react").JSX.Element;
/** Lê a configuração global do LibrasProvider mais próximo (ou {} se não houver). */
export declare function useLibrasConfig(): LibrasConfig;
