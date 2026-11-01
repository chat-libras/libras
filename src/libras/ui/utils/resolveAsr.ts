import type { AudioSource, ASROptions } from '../../core/asr/phrase-source';

export function resolveAsr(audio: AudioSource, asr?: ASROptions): ASROptions {
  if (asr) return asr;
  if (audio.kind === 'microphone') return { provider: 'webspeech', lang: 'pt-BR' };
  // Stream sem ASR explícito é um erro de configuração do consumidor — explode cedo
  // com mensagem clara em vez de deixar o phrase-source falhar de forma opaca.
  throw new Error(
    'ASR é obrigatório para AudioSource do tipo "stream". ' +
    'Passe asr={{ provider: "custom", factory: ... }} com um ASR de nuvem (Deepgram, AssemblyAI, etc.).'
  );
}
