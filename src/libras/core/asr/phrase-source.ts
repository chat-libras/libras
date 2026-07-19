import { createSpeechRecognizer } from './webspeech';
import { createCloudASR, type CloudASR, type CloudASRConfig } from './cloud-asr';

// ---------------------------------------------------------------------------
// Fonte de frases: abstrai "de onde vem o áudio" e "qual ASR usar", entregando
// frases finais (deduplicadas) prontas para sinalizar.
//
// Regra fundamental: a Web Speech API (grátis) SÓ ouve o microfone. Áudio de
// uma chamada de vídeo (MediaStream de um <video>/WebRTC) exige ASR de nuvem.
// ---------------------------------------------------------------------------

/** De onde vem o áudio a traduzir. */
export type AudioSource =
  | { kind: 'microphone' }
  | { kind: 'stream'; stream: MediaStream };

/** Qual motor de reconhecimento de fala. */
export type ASROptions =
  | { provider: 'webspeech'; lang?: string }
  | { provider: 'deepgram'; apiKey: string; lang?: string };

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
function makeDedup(onPhrase: (t: string) => void): (t: string) => void {
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
            'Web Speech API só ouve o microfone. Para áudio de chamada, use um provedor de nuvem (ex.: Deepgram).'
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

  // ---- ASR de nuvem (microfone OU stream de chamada) ----
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
      const config: CloudASRConfig = {
        provider: 'deepgram',
        apiKey: asr.apiKey,
        lang: asr.lang ?? 'pt-BR',
      };
      instance = createCloudASR(config, {
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
