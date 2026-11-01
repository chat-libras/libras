import type { AudioSource, ASROptions } from '../../core/asr/phrase-source';

export function resolveAsr(audio: AudioSource, asr?: ASROptions): ASROptions {
  if (asr) return asr;
  // Sem ASR explícito: microfone usa Web Speech (grátis); stream exige nuvem.
  if (audio.kind === 'microphone') return { provider: 'webspeech', lang: 'pt-BR' };
  return { provider: 'webspeech', lang: 'pt-BR' }; // inválido p/ stream → erro claro no phrase-source
}
