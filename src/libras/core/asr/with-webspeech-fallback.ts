import { createSpeechRecognizer } from './webspeech';
import type { ASRFactory, CloudASR, CloudASRCallbacks } from './cloud-asr';

// ---------------------------------------------------------------------------
// withWebSpeechFallback — envolve qualquer ASRFactory com fallback automático
// para a Web Speech API (microfone local, grátis, sem chave).
//
// Quando usar:
//   O provedor de ASR da chamada pode não estar disponível (stream ausente,
//   SDK não conectado, erro de rede). Em vez de propagar o erro, este helper
//   cai silenciosamente no microfone local via Web Speech.
//
// Comportamento:
//   1. Se o stream recebido for null/undefined → Web Speech direto (sem tentar o primary)
//   2. Se primary.start() lança → Web Speech como fallback
//   3. Se primary funcionar normalmente → sem fallback
//
// Uso:
//   asr={{ provider: 'custom', factory: withWebSpeechFallback(meuFactory) }}
// ---------------------------------------------------------------------------

function startWebSpeechFallback(
  callbacks: CloudASRCallbacks,
  lang: string
): CloudASR {
  const rec = createSpeechRecognizer(
    {
      onFinal: (text) => callbacks.onTranscript(text, true),
      onInterim: (text) => callbacks.onTranscript(text, false),
      onError: callbacks.onError,
    },
    lang
  );

  return {
    async start() {
      if (!rec) {
        callbacks.onError(
          'Web Speech API não suportada neste navegador (use Chrome). ' +
            'O provedor principal de ASR também falhou.'
        );
        return;
      }
      rec.start();
    },
    stop() {
      rec?.stop();
    },
  };
}

/**
 * Envolve um ASRFactory com fallback automático para Web Speech API.
 *
 * @param primaryFactory  Factory do seu provedor de ASR (Deepgram, AssemblyAI, etc.).
 * @param lang            Idioma para o fallback Web Speech. Default: 'pt-BR'.
 */
export function withWebSpeechFallback(primaryFactory: ASRFactory, lang = 'pt-BR'): ASRFactory {
  return (callbacks: CloudASRCallbacks): CloudASR => {
    const primary = primaryFactory(callbacks);
    let active: CloudASR = primary;

    return {
      async start(stream: MediaStream) {
        // Stream ausente → fallback direto (não vale tentar o primary)
        if (!stream || stream.getAudioTracks().length === 0) {
          const fallback = startWebSpeechFallback(callbacks, lang);
          active = fallback;
          await fallback.start(stream);
          return;
        }

        try {
          await primary.start(stream);
          active = primary;
        } catch {
          // Primary falhou → fallback para Web Speech
          const fallback = startWebSpeechFallback(callbacks, lang);
          active = fallback;
          await fallback.start(stream);
        }
      },
      stop() {
        active.stop();
      },
    };
  };
}
