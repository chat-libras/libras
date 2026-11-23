import { ASRFactory } from './cloud-asr';
/** De onde vem o áudio a traduzir. */
export type AudioSource = {
    kind: 'microphone';
} | {
    kind: 'stream';
    stream: MediaStream;
};
/** Qual motor de reconhecimento de fala usar. */
export type ASROptions = {
    provider: 'webspeech';
    lang?: string;
}
/** Provedor customizado: injete qualquer implementação de CloudASR via factory. */
 | {
    provider: 'custom';
    factory: ASRFactory;
};
export interface PhraseCallbacks {
    /** Frase final (deduplicada) pronta para sinalizar. */
    onPhrase: (text: string) => void;
    /** Transcrição parcial (para legenda ao vivo). */
    onInterim?: (text: string) => void;
    onError?: (error: string) => void;
    onListening?: (listening: boolean) => void;
}
export interface PhraseSource {
    /** Inicia a captura e o reconhecimento de fala. */
    start(): Promise<void>;
    /** Para a captura e libera o microfone/stream. */
    stop(): void;
}
/**
 * Cria um callback que filtra frases vazias e suprime repetições em menos de 3 s (ruído/eco).
 * Reutilizável por qualquer fonte de texto ao vivo (legendas, WebSocket, etc.).
 */
export declare function makeDedup(onPhrase: (t: string) => void): (t: string) => void;
/**
 * Cria uma {@link PhraseSource} que combina uma fonte de áudio e um motor de ASR,
 * entregando frases finais deduplicadas via `callbacks.onPhrase`.
 */
export declare function createPhraseSource(audio: AudioSource, asr: ASROptions, callbacks: PhraseCallbacks): PhraseSource;
