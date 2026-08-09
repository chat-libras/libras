import { useState } from 'react';
import { LibrasChat, type LibrasChatMessage, type LibrasChatRole } from 'libras-translator';
import { VideoBox } from '../components/VideoBox';

/** Spec 2 — Chat assimétrico controlado (LibrasChat). O pai gerencia messages[]. */
export function Spec2Chat() {
  const [messages, setMessages] = useState<LibrasChatMessage[]>([]);

  const send = (from: LibrasChatRole) => (text: string) =>
    setMessages((m) => [...m, { id: `${Date.now()}-${Math.random()}`, from, text }]);

  return (
    <div className="call__grid">
      <section className="call__panel">
        <div className="call__badge">👨‍⚕️ Médico (sender)</div>
        <VideoBox variant="camera" label="Médico" emoji="👨‍⚕️" />
        <p className="call__hint">Fale (🎤, Chrome/pt-BR) ou escreva. Lê as respostas do cliente.</p>
        <LibrasChat
          role="sender"
          messages={messages}
          onSend={send('sender')}
          labels={{ sender: 'Médico', receiver: 'Cliente' }}
        />
      </section>

      <section className="call__panel">
        <div className="call__badge">🧏 Cliente (receiver)</div>
        <VideoBox variant="placeholder" label="Cliente" emoji="🧏" />
        <p className="call__hint">Vê a fala do médico em Libras. Responde por texto.</p>
        <LibrasChat
          role="receiver"
          messages={messages}
          onSend={send('receiver')}
          labels={{ sender: 'Médico', receiver: 'Cliente' }}
        />
      </section>
    </div>
  );
}
