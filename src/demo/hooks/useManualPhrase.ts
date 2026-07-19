import { useState } from 'react';

// Controla o campo de texto da tradução manual: guarda a frase e dispara a
// tradução (ignorando entradas vazias) via callback recebido.
export function useManualPhrase(onTranslate: (text: string) => void) {
  const [phrase, setPhrase] = useState('Olá, como você está se sentindo hoje?');

  const submit = () => {
    const text = phrase.trim();
    if (text) onTranslate(text);
  };

  return { phrase, setPhrase, submit };
}
