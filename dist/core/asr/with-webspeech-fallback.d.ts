import { ASRFactory } from './cloud-asr';
/**
 * Envolve um ASRFactory com fallback automático para Web Speech API.
 *
 * @param primaryFactory  Factory do seu provedor de ASR (Deepgram, AssemblyAI, etc.).
 * @param lang            Idioma para o fallback Web Speech. Default: 'pt-BR'.
 */
export declare function withWebSpeechFallback(primaryFactory: ASRFactory, lang?: string): ASRFactory;
