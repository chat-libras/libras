import { useState } from 'react';
import type { LibrasChatMessage, LibrasChatRole } from 'libras-translator';

export interface ChatMessagesApi {
  messages: LibrasChatMessage[];
  sendAs: (role: LibrasChatRole) => (text: string) => void;
}

export function useChatMessages(): ChatMessagesApi {
  const [messages, setMessages] = useState<LibrasChatMessage[]>([]);

  const sendAs = (role: LibrasChatRole) => (text: string) =>
    setMessages((m) => [...m, { id: `${Date.now()}-${Math.random()}`, from: role, text }]);

  return { messages, sendAs };
}
