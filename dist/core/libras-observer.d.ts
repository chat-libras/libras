import { SignRenderer } from './sign-renderer.ts';
export interface LibrasObserverOptions {
    /** URL do endpoint PT→glosa. Default: traducao2.vlibras.gov.br/translate */
    translatorUrl?: string;
    /** Chamado quando a glosa é obtida — útil para debug/log. */
    onGlosa?: (text: string, glosa: string, fromCache: boolean) => void;
    /** Chamado em caso de erro na tradução. */
    onError?: (text: string, error: string) => void;
}
/**
 * Canal de texto → Libras com chunking por pontuação e cache de glosa.
 * Útil para integrar fontes externas de texto (legendas, WebSockets) sem usar ASR.
 */
export declare class LibrasObserver {
    private readonly glosaCache;
    private readonly renderer;
    private readonly translatorUrl;
    private readonly onGlosa?;
    private readonly onError?;
    constructor(renderer: SignRenderer, opts?: LibrasObserverOptions);
    /**
     * Recebe uma lista de textos, faz chunking e enfileira cada cláusula.
     * Pode ser chamado com texto parcial (interim ASR) ou final.
     */
    observe(texts: string[]): void;
    /**
     * Split por "." → sentenças; split por "," e ";" → cláusulas.
     * Filtra cláusulas vazias ou muito curtas (< 2 chars).
     */
    private chunkText;
    /**
     * Sinaliza uma cláusula.
     * - Cache hit: usa renderer.play(cached_glosa) se o renderer suportar
     * - Cache miss: usa renderer.play(clause) e faz prefetch da glosa em background
     */
    private signClause;
    /**
     * Chama o endpoint de tradução em background para popular o cache.
     * Não bloqueia a sinalização atual.
     */
    private prefetchGlosa;
    /** Limpa o cache de glosa (ex: ao trocar de sala). */
    clearCache(): void;
    get cacheSize(): number;
}
