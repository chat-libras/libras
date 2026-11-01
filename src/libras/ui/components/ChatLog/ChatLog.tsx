import { useEffect, useRef } from 'react';
import type { ChatLogProps } from '../../interfaces/ChatLogProps';
import './ChatLog.css';

export function ChatLog({ messages, mine, labels, className, style }: ChatLogProps) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  return (
    <div
      className={`libras-chat__log${className ? ` ${className}` : ''}`}
      style={style}
      role="log"
      aria-label="Histórico da conversa"
    >
      {messages.map((m) => (
        <div
          key={m.id}
          className={`libras-chat__bubble ${m.from === mine ? 'libras-chat__bubble--mine' : ''}`}
        >
          <span className="libras-chat__who">{labels[m.from]}</span>
          {m.text}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
