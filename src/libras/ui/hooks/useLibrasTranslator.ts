import { useCallback, useEffect, useRef, useState } from 'react';
import type { VLibrasLoaderOptions } from '../../core/vlibras-loader';
import { useLibrasAvatar, type LibrasAvatarApi } from './useLibrasAvatar';
import {
  createPhraseSource,
  type AudioSource,
  type ASROptions,
  type PhraseSource,
} from '../../core/asr/phrase-source';
import { resolveAsr } from '../utils/resolveAsr';

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
  /** Estado combinado: 'loading' → 'ready' → 'listening' | 'error'. */
  status: LibrasStatus;
  /** Mensagem de erro do avatar ou do ASR, se houver. */
  error: string | null;
  /** Transcrição parcial ao vivo (atualizada enquanto o usuário fala). */
  interim: string;
  /** `true` enquanto o ASR estiver capturando áudio. */
  listening: boolean;
  /** Inicia a captura de áudio e o reconhecimento de fala. */
  start: () => void;
  /** Para a captura e libera o microfone/stream. */
  stop: () => void;
  /** Alimenta um texto manualmente (sem áudio). */
  translate: (text: string) => void;
  /** Velocidade atual da sinalização (1 = normal). */
  speed: number;
  /** Ajusta a velocidade da sinalização ao vivo. */
  setSpeed: (speed: number) => void;
}

/**
 * Hook principal: combina avatar VLibras e ASR em uma única API.
 * Sinaliza automaticamente o áudio reconhecido; permite também enviar texto manual via `translate`.
 *
 * @example
 * const { containerRef, status, start, stop } = useLibrasTranslator({
 *   audio: { kind: 'microphone' },
 * });
 * <div ref={containerRef} style={{ width: 320, height: 240 }} />
 */
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
    const { audio, asr, onTranscript } = optsRef.current;
    setAsrError(null);
    let source;
    try {
      source = createPhraseSource(audio, resolveAsr(audio, asr), {
        onPhrase: (text) => {
          avatarRef.current?.translate(text);
          onTranscript?.(text);
        },
        onInterim: setInterim,
        onError: (e) => setAsrError(e),
        onListening: setListening,
      });
    } catch (e: unknown) {
      setAsrError(e instanceof Error ? e.message : String(e));
      return;
    }
    sourceRef.current = source;
    source.start().catch((e: unknown) => setAsrError(e instanceof Error ? e.message : String(e)));
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
