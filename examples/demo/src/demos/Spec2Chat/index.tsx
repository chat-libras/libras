/**
 * Spec 2 — Chat assimétrico controlado (LibrasChat)
 *
 * Padrão demonstrado: o PAI gerencia messages[]. LibrasChat é controlado —
 * recebe messages + onSend, não tem estado próprio de mensagens.
 * Ideal quando você precisa de persistência, timestamps ou sync com backend.
 *
 * Fluxo:
 *   useChatMessages()         → messages[] + sendAs(role)
 *     → ChatParticipant x2    → cada lado chama sendAs('sender'|'receiver')
 *       → LibrasChat           → renderiza + sinaliza o lado do avatar
 */
import { useChatMessages } from './hooks/useChatMessages';
import { ChatParticipant } from './components/ChatParticipant';

const LABELS = { sender: 'Médico', receiver: 'Cliente' } as const;

export function Spec2Chat() {
  const { messages, sendAs } = useChatMessages();

  return (
    <div className="call__grid">
      <ChatParticipant
        role="sender"
        badge="👨‍⚕️ Médico (sender)"
        videoVariant="camera"
        videoLabel={LABELS.sender}
        videoEmoji="👨‍⚕️"
        hint="Fale (🎤, Chrome/pt-BR) ou escreva. Lê as respostas do cliente."
        messages={messages}
        onSend={sendAs('sender')}
        labels={LABELS}
      />

      <ChatParticipant
        role="receiver"
        badge="🧏 Cliente (receiver)"
        videoVariant="placeholder"
        videoLabel={LABELS.receiver}
        videoEmoji="🧏"
        hint="Vê a fala do médico em Libras. Responde por texto."
        messages={messages}
        onSend={sendAs('receiver')}
        labels={LABELS}
      />
    </div>
  );
}
