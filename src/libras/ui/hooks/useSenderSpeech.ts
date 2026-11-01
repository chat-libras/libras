import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createPhraseSource,
  type AudioSource,
  type ASROptions,
  type PhraseSource,
} from '../../core/asr/phrase-source';

export interface SenderSpeechApi {
  /** Transcrição parcial ao vivo. */
  interim: string;
  listening: boolean;
  error: string | null;
  /** Alterna entre ouvir e parar. */
  toggle: () => void;
}

/**
 * Hook interno do `<LibrasChat role="sender">`: alterna entre ouvir e parar via `toggle`,
 * emitindo frases finais reconhecidas pelo callback `onPhrase`.
 */
export function useSenderSpeech(
  audio: AudioSource,
  asr: ASROptions,
  onPhrase: (text: string) => void
): SenderSpeechApi {
  const [interim, setInterim] = useState('');
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sourceRef = useRef<PhraseSource | null>(null);

  // onPhrase pode mudar a cada render; guarda a versão mais recente.
  const onPhraseRef = useRef(onPhrase);
  onPhraseRef.current = onPhrase;

  const toggle = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
      return;
    }
    setError(null);
    const source = createPhraseSource(audio, asr, {
      onPhrase: (text) => {
        onPhraseRef.current(text);
        setInterim('');
      },
      onInterim: setInterim,
      onListening: setListening,
      onError: (e) => {
        setError(e);
        setInterim('');
      },
    });
    sourceRef.current = source;
    source.start().catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, [audio, asr]);

  useEffect(() => () => sourceRef.current?.stop(), []);

  return { interim, listening, error, toggle };
}
