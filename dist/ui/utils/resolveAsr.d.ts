import { AudioSource, ASROptions } from '../../core/asr/phrase-source';
/**
 * Resolve o ASR a usar a partir da fonte de áudio e das opções fornecidas.
 * - Microfone sem ASR explícito → Web Speech API (pt-BR).
 * - Stream sem ASR explícito → lança com mensagem clara (configuração incorreta).
 */
export declare function resolveAsr(audio: AudioSource, asr?: ASROptions): ASROptions;
