import { useCallback, useEffect, useRef, useState } from 'react';
import type { VLibrasLoaderOptions } from '../core/vlibras-loader';
import { useLibrasAvatar, type LibrasAvatarApi } from './useLibrasAvatar';
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
// Compõe `useLibrasAvatar` (só o avatar/fila) e acrescenta a camada de ASR
// (start/parar/escuta/interim). Uso típico em telemedicina (traduzir a fala do
// médico para o paciente surdo):
//
//   const libras = useLibrasTranslator({
//     audio: { kind: 'stream', stream: remoteAudioStream },  // faixa de áudio do WebRTC
//     asr:   { provider: 'custom', factory: myASRFactory },
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
  /** Anexe a um <div> onde o avatar será renderizado (callback ref). */
  containerRef: React.RefCallback<HTMLDivElement>;
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

export function resolveAsr(audio: AudioSource, asr?: ASROptions): ASROptions {
  if (asr) return asr;
  // Sem ASR explícito: microfone usa Web Speech (grátis); stream exige nuvem.
  if (audio.kind === 'microphone') return { provider: 'webspeech', lang: 'pt-BR' };
  return { provider: 'webspeech', lang: 'pt-BR' }; // inválido p/ stream → erro claro no phrase-source
}

export function useLibrasTranslator(options: UseLibrasTranslatorOptions): LibrasTranslatorApi {
  const { audio, asr, vlibras, autoStart = true, speed: initialSpeed = 1, onTranscript } = options;

  const sourceRef = useRef<PhraseSource | null>(null);
  const optsRef = useRef({ audio, asr, onTranscript });
  optsRef.current = { audio, asr, onTranscript };

  const [interim, setInterim] = useState('');
  const [listening, setListening] = useState(false);
  const [asrError, setAsrError] = useState<string | null>(null);

  // O avatar (fila) é injetado abaixo; guardamos por ref para o start() usá-lo.
  const avatarRef = useRef<LibrasAvatarApi | null>(null);

  const stop = useCallback(() => {
    sourceRef.current?.stop();
    sourceRef.current = null;
    setListening(false);
    setInterim('');
  }, []);

  const start = useCallback(() => {
    if (sourceRef.current) return;
    const { audio: a, asr: r, onTranscript: ot } = optsRef.current;
    setAsrError(null);
    const source = createPhraseSource(a, resolveAsr(a, r), {
      onPhrase: (text) => {
        avatarRef.current?.translate(text);
        ot?.(text);
      },
      onInterim: setInterim,
      onError: (e) => setAsrError(e),
      onListening: setListening,
    });
    sourceRef.current = source;
    source.start().catch((e) => setAsrError(String(e?.message ?? e)));
  }, []);

  const autoStartRef = useRef(autoStart);
  autoStartRef.current = autoStart;

  const avatar = useLibrasAvatar({
    vlibras,
    speed: initialSpeed,
    onReady: () => {
      if (autoStartRef.current) start();
    },
  });
  avatarRef.current = avatar;

  // Para de ouvir ao desmontar (o avatar/singleton se gerencia sozinho).
  useEffect(() => () => stop(), [stop]);

  // Status combinado: erro (avatar ou ASR) e carregamento do avatar dominam;
  // senão, ouvindo → 'listening', ocioso → 'ready'.
  const status: LibrasStatus =
    avatar.status === 'error' || asrError
      ? 'error'
      : avatar.status === 'loading'
        ? 'loading'
        : listening
          ? 'listening'
          : 'ready';
  const error = avatar.error ?? asrError;

  return {
    containerRef: avatar.containerRef,
    status,
    error,
    interim,
    listening,
    start,
    stop,
    translate: avatar.translate,
    speed: avatar.speed,
    setSpeed: avatar.setSpeed,
  };
}
