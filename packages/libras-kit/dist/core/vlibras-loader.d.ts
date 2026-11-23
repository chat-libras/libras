import { VLibrasPlayerLike } from './vlibras-renderer';
interface VLibrasPlayerFull extends VLibrasPlayerLike {
    load(wrapper: HTMLElement): void;
    changeAvatar?(name: string): void;
}
interface VLibrasGlobal {
    Player: new (options: {
        targetPath: string;
        [key: string]: unknown;
    }) => VLibrasPlayerFull;
}
declare global {
    interface Window {
        VLibras?: VLibrasGlobal;
    }
}
export interface VLibrasLoaderOptions {
    /** URL do bundle do player (define window.VLibras). */
    bundleUrl?: string;
    /** URL onde estão os assets Unity (UnityLoader.js, playerweb.json, Build/). */
    targetPath?: string;
    /**
     * Endpoint de tradução PT→glosa (POST {text} → corpo = glosa). Default: endpoint
     * público do VLibras (`traducao2.vlibras.gov.br/translate`, com CORS). Para
     * self-hosting, aponte para a sua API (ex.: `/vlibras-translate`).
     */
    translatorUrl?: string;
    /** Avatar: 'icaro' | 'hozana' | 'guga'. */
    avatar?: string;
    /** Nome do evento de "carregado". */
    loadEvent?: string;
}
/** Reseta o singleton — use apenas quando o avatar for completamente desmontado. */
export declare function resetVLibrasPlayer(): void;
/**
 * Cria (ou reutiliza) o singleton do player VLibras num container DOM.
 * Injeta o bundle Unity uma única vez e aguarda o evento `'load'`.
 * Se o container mudar (troca de aba), move o canvas existente para o novo container.
 */
export declare function createVLibrasPlayer(container: HTMLElement, options?: VLibrasLoaderOptions): Promise<VLibrasPlayerLike>;
export {};
