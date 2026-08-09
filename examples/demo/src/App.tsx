import { useState } from 'react';
import { LibrasChat, type LibrasChatMessage, type LibrasChatRole } from 'libras-translator';
import { VideoBox } from './components/VideoBox';
import './styles.css';

// ---------------------------------------------------------------------------
// Demo ÚNICA: simula uma videochamada de teleconsulta com o chat acessível.
//
// Tela dividida em dois participantes, ligados por um canal EM MEMÓRIA que imita
// o transporte real (Vonage `session.signal()`, WebSocket, Firebase…):
//
//   Médico (ouvinte)  → fala no microfone (Web Speech, grátis) OU escreve.
//                       Sua mensagem chega ao cliente SINALIZADA em Libras.
//   Cliente (surdo)   → vê a fala do médico no avatar do VLibras; responde
//                       por texto, que o médico lê no chat.
//
// Num app real, cada lado roda numa máquina diferente e `onSend`/`messages`
// trafegam pelo transporte — o componente <LibrasChat> é o mesmo nos dois lados.
// ---------------------------------------------------------------------------

export function App() {
  const [messages, setMessages] = useState<LibrasChatMessage[]>([]);

  // Canal em memória compartilhado pelos dois lados (imita o transporte real).
  const send = (from: LibrasChatRole) => (text: string) =>
    setMessages((m) => [...m, { id: `${Date.now()}-${Math.random()}`, from, text }]);

  return (
    <div className="call">
      <header className="call__header">
        <h1>Teleconsulta acessível — médico ↔ cliente surdo</h1>
        <p>
          Simulação de videochamada com o componente <code>&lt;LibrasChat&gt;</code>. O médico
          fala ou escreve → o cliente vê em Libras. O cliente escreve → o médico lê no chat.
        </p>
      </header>

      <div className="call__grid">
        <section className="call__panel">
          <div className="call__badge">👨‍⚕️ Médico (ouvinte)</div>
          <VideoBox variant="camera" label="Médico" emoji="👨‍⚕️" />
          <p className="call__hint">Fale (🎤, Chrome/pt-BR) ou escreva. Lê as respostas do cliente.</p>
          <LibrasChat role="sender" messages={messages} onSend={send('sender')} labels={{ sender: 'Médico', receiver: 'Cliente' }} />
        </section>

        <section className="call__panel">
          <div className="call__badge">🧏 Cliente (surdo)</div>
          <VideoBox variant="placeholder" label="Cliente" emoji="🧏" />
          <p className="call__hint">Vê a fala do médico em Libras. Responde por texto.</p>
          <LibrasChat role="receiver" messages={messages} onSend={send('receiver')} labels={{ sender: 'Médico', receiver: 'Cliente' }} />
        </section>
      </div>

      <footer className="call__note">
        Canal em memória (demo). Em produção, ligue <code>onSend</code>/<code>messages</code> ao
        transporte da sua videochamada — ex.: Vonage <code>session.signal()</code>.
      </footer>
    </div>
  );
}
