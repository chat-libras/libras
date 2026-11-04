import { VLibrasLoaderOptions } from '../../core/vlibras-loader';
import { SignRenderer } from '../../core/sign-renderer';
export type LibrasAvatarStatus = 'loading' | 'ready' | 'error';
export interface UseLibrasAvatarOptions {
    /** Opções de carregamento do VLibras (bundleUrl, targetPath, avatar). */
    vlibras?: VLibrasLoaderOptions;
    /** Velocidade da sinalização do avatar (1 = normal). Default: 1. */
    speed?: number;
    /** Chamado assim que o avatar termina de carregar (fica 'ready'). */
    onReady?: () => void;
}
export interface LibrasAvatarApi {
    /** Anexe a um <div> onde o avatar será renderizado (callback ref ou ref object). */
    containerRef: React.RefCallback<HTMLDivElement>;
    status: LibrasAvatarStatus;
    error: string | null;
    /** Sinaliza um texto (enfileira; frases não se atropelam). */
    translate: (text: string) => void;
    /** Velocidade atual da sinalização (1 = normal). */
    speed: number;
    /** Ajusta a velocidade da sinalização ao vivo. */
    setSpeed: (speed: number) => void;
    /** Renderer interno — use para integrar com LibrasObserver (uso avançado). */
    renderer: SignRenderer | null;
}
/**
 * Hook de baixo nível que controla apenas o avatar (sem ASR).
 * Use quando precisar sinalizar texto de outra fonte (legenda, teclado, stream já transcrito).
 *
 * @example
 * const { containerRef, translate } = useLibrasAvatar();
 * <div ref={containerRef} style={{ width: 320, height: 240 }} />
 * <button onClick={() => translate('Bom dia')}>Sinalizar</button>
 */
export declare function useLibrasAvatar(options?: UseLibrasAvatarOptions): LibrasAvatarApi;
