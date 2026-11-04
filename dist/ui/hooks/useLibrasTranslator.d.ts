import { VLibrasLoaderOptions } from '../../core/vlibras-loader';
import { AudioSource, ASROptions } from '../../core/asr/phrase-source';
export type LibrasStatus = 'loading' | 'ready' | 'listening' | 'error';
export interface UseLibrasTranslatorOptions {
    /** Fonte de áudio: microfone ou um MediaStream (chamada de vídeo). */
    audio: AudioSource;
    /** Motor de ASR. Default: 'webspeech' para microfone (obrigatório p/ stream). */
    asr?: ASROptions;
    /** Opções de carregamento do VLibras (bundleUrl, targetPath, avatar). */
    vlibras?: VLibrasLoaderOptions;
    /** Começar a ouvir assim que o avatar carregar. Default: true. */
    autoStart?: boolean;
    /** Velocidade da sinalização do avatar (1 = normal). Default: 1. */
    speed?: number;
    /** Callback a cada frase final reconhecida (para legendas, logs). */
    onTranscript?: (text: string) => void;
}
export interface LibrasTranslatorApi {
    /** Anexe a um <div> onde o avatar será renderizado (callback ref). */
    containerRef: React.RefCallback<HTMLDivElement>;
    /** Estado combinado: 'loading' → 'ready' → 'listening' | 'error'. */
    status: LibrasStatus;
    /** Mensagem de erro do avatar ou do ASR, se houver. */
    error: string | null;
    /** Transcrição parcial ao vivo (atualizada enquanto o usuário fala). */
    interim: string;
    /** `true` enquanto o ASR estiver capturando áudio. */
    listening: boolean;
    /** Inicia a captura de áudio e o reconhecimento de fala. */
    start: () => void;
    /** Para a captura e libera o microfone/stream. */
    stop: () => void;
    /** Alimenta um texto manualmente (sem áudio). */
    translate: (text: string) => void;
    /** Velocidade atual da sinalização (1 = normal). */
    speed: number;
    /** Ajusta a velocidade da sinalização ao vivo. */
    setSpeed: (speed: number) => void;
}
/**
 * Hook principal: combina avatar VLibras e ASR em uma única API.
 * Sinaliza automaticamente o áudio reconhecido; permite também enviar texto manual via `translate`.
 *
 * @example
 * const { containerRef, status, start, stop } = useLibrasTranslator({
 *   audio: { kind: 'microphone' },
 * });
 * <div ref={containerRef} style={{ width: 320, height: 240 }} />
 */
export declare function useLibrasTranslator(options: UseLibrasTranslatorOptions): LibrasTranslatorApi;
