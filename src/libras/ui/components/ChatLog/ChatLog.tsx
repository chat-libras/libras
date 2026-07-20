import { useEffect, useRef } from 'react';
import type { ChatLogProps } from '../../interfaces/ChatLogProps';
import './ChatLog.css';

// Log de mensagens (bolhas), reusado pelos dois lados. As bolhas do próprio
// papel (`mine`) alinham à direita; rola para a última a cada nova mensagem.
export function ChatLog({ messages, mine, labels }: ChatLogProps) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  return (
    <div className="libras-chat__log">
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
