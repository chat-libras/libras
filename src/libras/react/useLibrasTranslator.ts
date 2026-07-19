import { useCallback, useEffect, useRef, useState } from 'react';
import { createVLibrasPlayer, type VLibrasLoaderOptions } from '../core/vlibras-loader';
import { VLibrasSignRenderer } from '../core/vlibras-renderer';
import {
  createPhraseSource,
  type AudioSource,
  type ASROptions,
  type PhraseSource,
} from '../core/asr/phrase-source';

// ---------------------------------------------------------------------------
// Hook principal do plugin: monta o avatar do VLibras num container e traduz um
// áudio (microfone ou stream de chamada) para Libras em tempo real, com fila
// sincronizada (frases não se atropelam).
//
// Uso típico em telemedicina (traduzir a fala do médico para o paciente surdo):
//
//   const libras = useLibrasTranslator({
//     audio: { kind: 'stream', stream: remoteAudioStream },  // faixa de áudio do WebRTC
//     asr:   { provider: 'deepgram', apiKey: import.meta.env.VITE_DEEPGRAM_KEY },
//   });
//   return <div ref={libras.containerRef} className="avatar" />;
// ---------------------------------------------------------------------------

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
  /** Anexe a um <div> onde o avatar será renderizado. */
  containerRef: React.RefObject<HTMLDivElement>;
  status: LibrasStatus;
  error: string | null;
  /** Transcrição parcial ao vivo. */
  interim: string;
  listening: boolean;
  start: () => void;
  stop: () => void;
  /** Alimenta um texto manualmente (sem áudio). */
  translate: (text: string) => void;
  /** Velocidade atual da sinalização (1 = normal). */
  speed: number;
  /** Ajusta a velocidade da sinalização ao vivo. */
  setSpeed: (speed: number) => void;
}

// Singletons: o Unity/WebGL do VLibras é pesado e só deve existir uma vez
// (StrictMode monta 2×; múltiplos renderers = múltiplos listeners = repetição).
let rendererSingleton: VLibrasSignRenderer | null = null;

function resolveAsr(audio: AudioSource, asr?: ASROptions): ASROptions {
  if (asr) return asr;
  // Sem ASR explícito: microfone usa Web Speech (grátis); stream exige nuvem.
  if (audio.kind === 'microphone') return { provider: 'webspeech', lang: 'pt-BR' };
  return { provider: 'webspeech', lang: 'pt-BR' }; // inválido p/ stream → erro claro no phrase-source
}

export function useLibrasTranslator(options: UseLibrasTranslatorOptions): LibrasTranslatorApi {
  const { audio, asr, vlibras, autoStart = true, speed: initialSpeed = 1, onTranscript } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<PhraseSource | null>(null);
  const optsRef = useRef({ audio, asr, onTranscript });
  optsRef.current = { audio, asr, onTranscript };

  const [status, setStatus] = useState<LibrasStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [interim, setInterim] = useState('');
  const [listening, setListening] = useState(false);
  const [speed, setSpeedState] = useState(initialSpeed);

  const setSpeed = useCallback((value: number) => {
    setSpeedState(value);
    rendererSingleton?.setSpeed(value);
  }, []);

  const stop = useCallback(() => {
    sourceRef.current?.stop();
    sourceRef.current = null;
    setListening(false);
    setInterim('');
    setStatus((s) => (s === 'listening' ? 'ready' : s));
  }, []);

  const start = useCallback(() => {
    if (!rendererSingleton || sourceRef.current) return;
    const { audio: a, asr: r, onTranscript: ot } = optsRef.current;
    setError(null);
    const source = createPhraseSource(a, resolveAsr(a, r), {
      onPhrase: (text) => {
        rendererSingleton?.play(text);
        ot?.(text);
      },
      onInterim: setInterim,
      onError: (e) => {
        setError(e);
        setStatus('error');
      },
      onListening: (l) => {
        setListening(l);
        setStatus(l ? 'listening' : 'ready');
      },
    });
    sourceRef.current = source;
    source.start().catch((e) => {
      setError(String(e?.message ?? e));
      setStatus('error');
    });
  }, []);

  const translate = useCallback((text: string) => {
    rendererSingleton?.play(text);
  }, []);

  // Carrega o avatar do VLibras uma vez e (opcional) começa a ouvir.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let disposed = false;

    createVLibrasPlayer(container, vlibras)
      .then((player) => {
        if (disposed) return;
        if (!rendererSingleton) {
          rendererSingleton = new VLibrasSignRenderer(player, { settleMs: 250 });
        }
        rendererSingleton.setSpeed(speed);
        rendererSingleton.clear();
        setStatus('ready');
        if (autoStart) start();
      })
      .catch((e) => {
        if (!disposed) {
          setError(String(e?.message ?? e));
          setStatus('error');
        }
      });

    return () => {
      disposed = true;
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { containerRef, status, error, interim, listening, start, stop, translate, speed, setSpeed };
}
