import { createSpeechRecognizer } from './webspeech';
import type { CloudASR, ASRFactory } from './cloud-asr';

// ---------------------------------------------------------------------------
// Fonte de frases: abstrai "de onde vem o áudio" e "qual ASR usar", entregando
// frases finais (deduplicadas) prontas para sinalizar.
//
// Regra: a Web Speech API (grátis) SÓ ouve o microfone. Áudio de uma chamada
// (MediaStream de WebRTC/vídeo) exige ASR de nuvem via 'custom' factory.
//
// Para usar um ASR de nuvem, implemente ASRFactory e passe via 'custom':
//   const myFactory: ASRFactory = (cb) => ({ start, stop });
//   asr={{ provider: 'custom', factory: myFactory }}
// ---------------------------------------------------------------------------

/** De onde vem o áudio a traduzir. */
export type AudioSource =
  | { kind: 'microphone' }
  | { kind: 'stream'; stream: MediaStream };

/** Qual motor de reconhecimento de fala usar. */
export type ASROptions =
  | { provider: 'webspeech'; lang?: string }
  /** Provedor customizado: injete qualquer implementação de CloudASR via factory. */
  | { provider: 'custom'; factory: ASRFactory };

export interface PhraseCallbacks {
  /** Frase final (deduplicada) pronta para sinalizar. */
  onPhrase: (text: string) => void;
  /** Transcrição parcial (para legenda ao vivo). */
  onInterim?: (text: string) => void;
  onError?: (error: string) => void;
  onListening?: (listening: boolean) => void;
}

export interface PhraseSource {
  start(): Promise<void>;
  stop(): void;
}

// Descarta frases vazias e a mesma frase repetida em <3s (ruído/eco).
// Exportado para reuso por fontes de texto ao vivo (ex.: legendas do Teams).
export function makeDedup(onPhrase: (t: string) => void): (t: string) => void {
  let last = '';
  let at = 0;
  return (text: string) => {
    const clean = text.trim();
    const now = Date.now();
    if (clean.length < 2) return;
    if (clean === last && now - at < 3000) return;
    last = clean;
    at = now;
    onPhrase(clean);
  };
}

export function createPhraseSource(
  audio: AudioSource,
  asr: ASROptions,
  cb: PhraseCallbacks
): PhraseSource {
  const emit = makeDedup(cb.onPhrase);

  // ---- Web Speech API (só microfone) ----
  if (asr.provider === 'webspeech') {
    if (audio.kind === 'stream') {
      return {
        async start() {
          cb.onError?.(
            'Web Speech API só ouve o microfone. Para áudio de chamada, ' +
              'use { provider: "custom", factory } com um ASR de nuvem.'
          );
        },
        stop() {},
      };
    }
    const rec = createSpeechRecognizer(
      {
        onFinal: emit,
        onInterim: cb.onInterim,
        onError: cb.onError,
        onStateChange: cb.onListening,
      },
      asr.lang
    );
    return {
      async start() {
        if (!rec) {
          cb.onError?.('Web Speech API não suportada neste navegador (use o Chrome).');
          return;
        }
        rec.start();
      },
      stop() {
        rec?.stop();
      },
    };
  }

  // ---- ASR customizado via factory (agnóstico de provedor) ----
  let instance: CloudASR | null = null;
  let ownedStream: MediaStream | null = null;
  return {
    async start() {
      let stream: MediaStream;
      if (audio.kind === 'stream') {
        stream = audio.stream;
      } else {
        ownedStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream = ownedStream;
      }
      instance = asr.factory({
        onTranscript: (text, final) => {
          cb.onInterim?.(text);
          if (final) emit(text);
        },
        onError: (e) => cb.onError?.(e),
      });
      cb.onListening?.(true);
      await instance.start(stream);
    },
    stop() {
      instance?.stop();
      instance = null;
      ownedStream?.getTracks().forEach((t) => t.stop());
      ownedStream = null;
      cb.onListening?.(false);
    },
  };
}
