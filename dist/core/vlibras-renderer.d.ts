import { SignRenderer } from './sign-renderer';
/** Contrato mínimo do player do VLibras que precisamos (DIP). */
export interface VLibrasPlayerLike {
    /** Sinaliza um texto/glosa via tradução interna (PT → glosa → animação). */
    translate(text: string): void;
    /** Assina um evento (ex.: fim da animação). */
    on(event: string, handler: () => void): void;
    /** Opcional: ajuste de velocidade, se o player suportar. */
    setSpeed?(speed: number): void;
    /** Opcional: interromper a sinalização atual. */
    stop?(): void;
    /** Opcional: sinalizar uma glosa diretamente (sem round-trip ao traducao2). */
    play?(glosa: string): void;
}
export interface VLibrasRendererOptions {
    /** Nome do evento de "terminou de sinalizar" emitido pelo player. */
    endEvent?: string;
    /** Máximo de frases na fila antes de descartar as antigas (tempo real). */
    maxBacklog?: number;
    /**
     * Janela (ms) após emitir translate() em que eventos de fim são ignorados.
     * O player do VLibras chama stop() internamente ao traduzir, o que pode emitir
     * um "animation:end" espúrio; este guarda evita atropelar a fila. Default 0
     * (desligado) para testes determinísticos — use ~250 com o player real.
     */
    settleMs?: number;
}
/**
 * Adapter do player VLibras para {@link SignRenderer}.
 * Mantém uma fila sincronizada: cada frase aguarda o avatar terminar de sinalizar
 * antes de a próxima começar. Frases antigas são descartadas quando a fila enche
 * (mantém tempo real quando a fala supera a velocidade de sinalização).
 */
export declare class VLibrasSignRenderer implements SignRenderer {
    private player;
    private queue;
    private isSigning;
    private lastIssuedAt;
    private readonly maxBacklog;
    private readonly settleMs;
    constructor(player: VLibrasPlayerLike, opts?: VLibrasRendererOptions);
    /** Trata o evento de fim, ignorando disparos espúrios logo após translate(). */
    private onEnd;
    play(text: string): void;
    /** Puxa a próxima frase da fila e manda o player sinalizar. */
    private advance;
    clear(): void;
    setSpeed(speed: number): void;
    get busy(): boolean;
    get pending(): number;
    dispose(): void;
}
