/**
 * Receptor de linhas de legenda que as encaminha ao avatar de Libras.
 * Use quando a plataforma já entrega texto (ex.: legendas ao vivo do Teams).
 */
export interface CaptionSink {
    /** Enfileira uma linha final de legenda para sinalização. */
    push(line: string): void;
}
/** Cria um sink que encaminha linhas de legenda para `translate`, deduplicadas. */
export declare function createCaptionSink(translate: (text: string) => void): CaptionSink;
