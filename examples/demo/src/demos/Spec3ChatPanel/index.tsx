/**
 * Spec 3 — Chat drop-in autogerenciado (LibrasChatPanel)
 *
 * Padrão demonstrado: o componente tem estado interno de mensagens.
 * Você só conecta incomingMessage (o que chega) e onMessage (o que sai)
 * ao seu transporte (WebSocket, socket.io, etc.).
 *
 * Fluxo:
 *   useMemoryChannel()          → canal bidirecional em memória
 *     → PanelParticipant x2     → cada lado conectado ao canal
 *       → LibrasChatPanel        → gerencia mensagens internamente
 */
import { useMemoryChannel } from './hooks/useMemoryChannel';
import { PanelParticipant } from './components/PanelParticipant';

const LABELS = { speaker: 'Professor', listener: 'Aluno' } as const;

export function Spec3ChatPanel() {
  const { speakerMsg, listenerMsg, onSpeakerMessage, onListenerMessage } = useMemoryChannel();

  return (
    <div className="call__grid">
      <PanelParticipant
        role="speaker"
        badge="🎤 Professor (speaker)"
        hint="Fala ou digita. Estado interno — zero props além de role."
        incomingMessage={listenerMsg}
        onMessage={onSpeakerMessage}
        labels={LABELS}
      />

      <PanelParticipant
        role="listener"
        badge="🧏 Aluno (listener)"
        hint="Vê o professor em Libras. Responde por texto."
        incomingMessage={speakerMsg}
        onMessage={onListenerMessage}
        labels={LABELS}
      />
    </div>
  );
}
