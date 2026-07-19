import { useEffect } from 'react';
import { CHAT_CSS } from '../utils/chatStyles';

const STYLE_ID = 'libras-chat-styles';

// Injeta os estilos padrão do chat uma única vez (idempotente).
export function useChatStyles(): void {
  useEffect(() => {
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = CHAT_CSS;
    document.head.appendChild(el);
  }, []);
}
