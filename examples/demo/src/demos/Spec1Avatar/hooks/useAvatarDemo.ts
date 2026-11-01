import { useState } from 'react';
import { useLibrasTranslator, type LibrasTranslatorApi } from 'libras-translator';

export interface AvatarDemoApi {
  libras: LibrasTranslatorApi;
  text: string;
  onTextChange: (text: string) => void;
  onSend: () => void;
}

export function useAvatarDemo(): AvatarDemoApi {
  const [text, setText] = useState('');

  const libras = useLibrasTranslator({
    audio: { kind: 'microphone' },
    autoStart: false,
  });

  const onSend = () => {
    if (!text.trim()) return;
    libras.translate(text.trim());
    setText('');
  };

  return { libras, text, onTextChange: setText, onSend };
}
