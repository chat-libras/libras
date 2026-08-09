import { useState, useCallback, useEffect, useRef } from 'react';
import { debugBus } from '../../debug/event-bus/index.ts';
import type { ChatMessage, UseChatResult } from './useChat.types.ts';

export function useChat(
  ws: WebSocket | null,
  myId: string,
  roomId: string,
): UseChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const wsRef = useRef(ws);
  wsRef.current = ws;

  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data as string) as Record<string, unknown>;
        if (msg['type'] !== 'chat:message') return;

        const chatMsg: ChatMessage = {
          id: `${msg['ts']}-${msg['from']}`,
          from: msg['from'] as string,
          text: msg['text'] as string,
          ts: msg['ts'] as number,
          isMine: msg['from'] === myId,
        };

        debugBus.emit('socket', 'chat:message', {
          from: chatMsg.from,
          text: chatMsg.text.slice(0, 60),
          isMine: chatMsg.isMine,
        });

        setMessages((prev) => [...prev, chatMsg]);
      } catch {
        // ignora mensagens não relacionadas ao chat
      }
    };

    ws.addEventListener('message', handleMessage);
    return () => ws.removeEventListener('message', handleMessage);
  }, [ws, myId]);

  const send = useCallback(
    (text: string) => {
      const socket = wsRef.current;
      if (!socket || socket.readyState !== WebSocket.OPEN || !text.trim()) return;

      socket.send(
        JSON.stringify({
          type: 'chat:message',
          roomId,
          from: myId,
          text: text.trim(),
          ts: Date.now(),
        }),
      );
    },
    [myId, roomId],
  );

  return { messages, send };
}
