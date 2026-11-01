import { useEffect, useRef, useState } from 'react';
import { LibrasChat } from './LibrasChat';
import type { LibrasChatMessage, LibrasChatRole } from './interfaces/LibrasChatProps';
import type { LibrasChatPanelProps } from './interfaces/LibrasChatPanelProps';

export type { LibrasChatPanelRole, LibrasChatPanelProps } from './interfaces/LibrasChatPanelProps';

export function LibrasChatPanel({
  role,
  incomingMessage,
  onMessage,
  labels,
  speed = 1.3,
  ...rest
}: LibrasChatPanelProps) {
  const [messages, setMessages] = useState<LibrasChatMessage[]>([]);
  const prevIncoming = useRef<string | undefined>(undefined);

  // speaker → sender (capta áudio); listener → receiver (vê avatar)
  const chatRole: LibrasChatRole = role === 'speaker' ? 'sender' : 'receiver';
  const otherRole: LibrasChatRole = role === 'speaker' ? 'receiver' : 'sender';

  // Novo texto recebido do outro lado → adiciona ao log (guard contra duplicatas)
  useEffect(() => {
    if (!incomingMessage || incomingMessage === prevIncoming.current) return;
    prevIncoming.current = incomingMessage;
    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), from: otherRole, text: incomingMessage },
    ]);
  }, [incomingMessage, otherRole]);

  const handleSend = (text: string) => {
    setMessages((m) => [...m, { id: crypto.randomUUID(), from: chatRole, text }]);
    onMessage?.(text);
  };

  const resolvedLabels: Partial<Record<LibrasChatRole, string>> = {
    sender: labels?.speaker ?? 'Professor',
    receiver: labels?.listener ?? 'Aluno',
  };

  return (
    <LibrasChat
      role={chatRole}
      messages={messages}
      onSend={handleSend}
      labels={resolvedLabels}
      speed={speed}
      {...rest}
    />
  );
}
