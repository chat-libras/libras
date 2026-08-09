import { useState } from 'react';
import { LibrasChatPanel } from 'libras-translator';

/**
 * Spec 3 — Chat drop-in autogerenciado (LibrasChatPanel).
 * Não precisa gerenciar messages[]. Basta ligar incomingMessage ao transporte.
 */
export function Spec3ChatPanel() {
  // Canal em memória simulando transporte real (WebSocket, socket.io…)
  const [speakerMsg, setSpeakerMsg] = useState('');
  const [listenerMsg, setListenerMsg] = useState('');

  return (
    <div className="call__grid">
      <section className="call__panel">
        <div className="call__badge">🎤 Professor (speaker)</div>
        <p className="call__hint">
          Fala ou digita. Estado interno — zero props além de <code>role</code>.
        </p>
        <LibrasChatPanel
          role="speaker"
          incomingMessage={listenerMsg}
          onMessage={setSpeakerMsg}
          labels={{ speaker: 'Professor', listener: 'Aluno' }}
        />
      </section>

      <section className="call__panel">
        <div className="call__badge">🧏 Aluno (listener)</div>
        <p className="call__hint">
          Vê o professor em Libras. Responde por texto.
        </p>
        <LibrasChatPanel
          role="listener"
          incomingMessage={speakerMsg}
          onMessage={setListenerMsg}
          labels={{ speaker: 'Professor', listener: 'Aluno' }}
        />
      </section>
    </div>
  );
}
