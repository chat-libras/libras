import { useEffect, useRef } from 'react';
import { newIncomingMessages } from '../utils/messages';
import type { LibrasChatMessage } from '../interfaces/LibrasChatProps';

// Sinalização do lado CLIENTE: cada nova mensagem vinda do MÉDICO é enviada ao
// avatar para ser sinalizada em Libras. Guarda quantas mensagens já foram vistas
// para não re-sinalizar o histórico a cada render.
export function useClientSignaling(
  messages: LibrasChatMessage[],
  translate: (text: string) => void
): void {
  const seen = useRef(0);

  // translate pode mudar de identidade entre renders; usa sempre a última.
  const translateRef = useRef(translate);
  translateRef.current = translate;

  useEffect(() => {
    for (const m of newIncomingMessages(messages, 'client', seen.current)) {
      translateRef.current(m.text);
    }
    seen.current = messages.length;
  }, [messages]);
}
