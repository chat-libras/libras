export interface SpeechCallbacks {
    /** Frase final reconhecida (pronta para traduzir). */
    onFinal: (text: string) => void;
    /** Transcrição parcial em andamento (para legenda "ao vivo"). */
    onInterim?: (text: string) => void;
    onError?: (error: string) => void;
    onStateChange?: (listening: boolean) => void;
}
export interface SpeechController {
    start(): void;
    stop(): void;
    readonly listening: boolean;
}
/** Web Speech API disponível neste navegador? */
export declare function isSpeechSupported(): boolean;
/** Cria um reconhecedor pt-BR contínuo. Retorna null se não houver suporte. */
export declare function createSpeechRecognizer(callbacks: SpeechCallbacks, lang?: string): SpeechController | null;
