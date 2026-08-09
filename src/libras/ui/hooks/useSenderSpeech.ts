import { useEffect, useRef, useState } from 'react';
import {
  createPhraseSource,
  type AudioSource,
  type ASROptions,
  type PhraseSource,
} from '../../core/asr/phrase-source';

// Captura de fala do lado SENDER: liga/desliga a fonte de frases (ASR plugável)
// e entrega cada frase final via `onPhrase`. Web Speech (grátis) por padrão, ou
// um provedor de nuvem, conforme `audio`/`asr` — toda a lógica vem do Core.

export interface SenderSpeech {
  /** Transcrição parcial ao vivo. */
  interim: string;
  listening: boolean;
  error: string | null;
  /** Alterna entre ouvir e parar. */
  toggle: () => void;
}

export function useSenderSpeech(
  audio: AudioSource,
  asr: ASROptions,
  onPhrase: (text: string) => void
): SenderSpeech {
  const [interim, setInterim] = useState('');
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sourceRef = useRef<PhraseSource | null>(null);

  // onPhrase pode mudar a cada render; guarda a versão mais recente.
  const onPhraseRef = useRef(onPhrase);
  onPhraseRef.current = onPhrase;

  const toggle = () => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
      return;
    }
    setError(null);
    const source = createPhraseSource(audio, asr, {
      onPhrase: (t) => {
        onPhraseRef.current(t);
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
    source.start().catch((e) => setError(String(e?.message ?? e)));
  };

  useEffect(() => () => sourceRef.current?.stop(), []);

  return { interim, listening, error, toggle };
}
