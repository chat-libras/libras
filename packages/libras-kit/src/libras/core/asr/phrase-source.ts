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
  /** Inicia a captura e o reconhecimento de fala. */
  start(): Promise<void>;
  /** Para a captura e libera o microfone/stream. */
  stop(): void;
}

/**
 * Cria um callback que filtra frases vazias e suprime repetições em menos de 3 s (ruído/eco).
 * Reutilizável por qualquer fonte de texto ao vivo (legendas, WebSocket, etc.).
 */
export function makeDedup(onPhrase: (t: string) => void): (t: string) => void {
  let last = '';
  let lastEmittedAt = 0;
  return (text: string) => {
    const clean = text.trim();
    const now = Date.now();
    if (clean.length < 2) return;
    if (clean === last && now - lastEmittedAt < 3000) return;
    last = clean;
    lastEmittedAt = now;
    onPhrase(clean);
  };
}

/**
 * Cria uma {@link PhraseSource} que combina uma fonte de áudio e um motor de ASR,
 * entregando frases finais deduplicadas via `callbacks.onPhrase`.
 */
export function createPhraseSource(
  audio: AudioSource,
  asr: ASROptions,
  callbacks: PhraseCallbacks
): PhraseSource {
  const emit = makeDedup(callbacks.onPhrase);

  // ---- Web Speech API (só microfone) ----
  if (asr.provider === 'webspeech') {
    if (audio.kind === 'stream') {
      return {
        async start() {
          callbacks.onError?.(
            'Web Speech API só ouve o microfone. Para áudio de chamada, ' +
              'use { provider: "custom", factory } com um ASR de nuvem.'
          );
        },
        stop() {},
      };
    }
    const recognizer = createSpeechRecognizer(
      {
        onFinal: emit,
        onInterim: callbacks.onInterim,
        onError: callbacks.onError,
        onStateChange: callbacks.onListening,
      },
      asr.lang
    );
    return {
      async start() {
        if (!recognizer) {
          callbacks.onError?.('Web Speech API não suportada neste navegador (use o Chrome).');
          return;
        }
        recognizer.start();
      },
      stop() {
        recognizer?.stop();
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
          callbacks.onInterim?.(text);
          if (final) emit(text);
        },
        onError: (e) => callbacks.onError?.(e),
      });
      callbacks.onListening?.(true);
      await instance.start(stream);
    },
    stop() {
      instance?.stop();
      instance = null;
      ownedStream?.getTracks().forEach((track) => track.stop());
      ownedStream = null;
      callbacks.onListening?.(false);
    },
  };
}
