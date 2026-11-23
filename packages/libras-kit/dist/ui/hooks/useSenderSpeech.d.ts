import { AudioSource, ASROptions } from '../../core/asr/phrase-source';
export interface SenderSpeechApi {
    /** Transcrição parcial ao vivo. */
    interim: string;
    listening: boolean;
    error: string | null;
    /** Alterna entre ouvir e parar. */
    toggle: () => void;
}
/**
 * Hook interno do `<LibrasChat role="sender">`: alterna entre ouvir e parar via `toggle`,
 * emitindo frases finais reconhecidas pelo callback `onPhrase`.
 */
export declare function useSenderSpeech(audio: AudioSource, asr: ASROptions, onPhrase: (text: string) => void): SenderSpeechApi;
