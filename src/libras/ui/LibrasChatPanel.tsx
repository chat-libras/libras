import { useEffect, useRef, useState } from 'react';
import { LibrasChat } from './LibrasChat';
import type { LibrasChatMessage, LibrasChatRole } from './interfaces/LibrasChatProps';
import type { AudioSource, ASROptions } from '../core/asr/phrase-source';
import type { VLibrasLoaderOptions } from '../core/vlibras-loader';
import type { LibrasStrings } from './strings';

// ---------------------------------------------------------------------------
// <LibrasChatPanel> — componente drop-in que envolve <LibrasChat> com estado
// interno de mensagens. Ideal para quem não quer gerenciar mensagens no pai.
//
// Casos de uso: aulas online, atendimento ao cliente, triagem hospitalar —
// qualquer cenário onde um lado é surdo e precisa do avatar + chat prontos.
//
// Diferença de <LibrasChat>:
//   - <LibrasChat>    → controlado: o pai gerencia messages[] e onSend
//   - <LibrasChatPanel> → autogerenciado: estado interno; basta passar
//     incomingMessage (string) e onMessage (callback do transporte)
//
// Integração com transporte (WebSocket, socket.io, Firebase, etc.):
//   const [incoming, setIncoming] = useState('');
//   socket.on('mensagem', setIncoming);
//
//   <LibrasChatPanel
//     role="listener"
//     incomingMessage={incoming}
//     onMessage={(text) => socket.emit('mensagem', text)}
//   />
// ---------------------------------------------------------------------------

export type LibrasChatPanelRole = 'speaker' | 'listener';

export interface LibrasChatPanelProps {
  /**
   * 'speaker' — quem fala (professor, médico, atendente):
   *   capta áudio (microfone) ou digita; vê as respostas do outro lado em texto.
   * 'listener' — quem assiste (aluno surdo, paciente):
   *   vê as mensagens do speaker sinalizadas pelo avatar VLibras; responde por texto.
   */
  role: LibrasChatPanelRole;

  /**
   * Texto recebido do outro lado da chamada.
   * Cada mudança de valor (string diferente da anterior) adiciona uma nova
   * mensagem ao log. Conecte ao seu transporte: socket.io, WebSocket, Firebase…
   */
  incomingMessage?: string;

  /**
   * Chamado quando este lado envia uma mensagem (digitada ou reconhecida por voz).
   * Use para transmitir ao outro lado via o seu transporte.
   * Opcional — omitir cria um chat local sem transporte (útil para testes).
   */
  onMessage?: (text: string) => void;

  /** Opções do avatar VLibras (bundleUrl, avatar, translatorUrl). */
  vlibras?: VLibrasLoaderOptions;

  /** Velocidade da sinalização do avatar (1 = normal). Default: 1.3. */
  speed?: number;

  /**
   * Fonte de áudio para o lado 'speaker'. Default: microfone local.
   * Para capturar o áudio de uma chamada: { kind: 'stream', stream }.
   */
  audio?: AudioSource;

  /**
   * Motor de ASR para o lado 'speaker'. Default: Web Speech API (pt-BR).
   * Para stream de chamada: { provider: 'custom', factory }.
   */
  asr?: ASROptions;

  /**
   * Labels das bolhas. Default: { speaker: 'Professor', listener: 'Aluno' }.
   * Sobrescreva para qualquer contexto: 'Médico'/'Paciente', 'Atendente'/'Cliente'.
   */
  labels?: { speaker?: string; listener?: string };

  /** Textos da UI (botões, placeholders). Sobrescreva para i18n ou rebranding. */
  strings?: LibrasStrings;

  className?: string;
  style?: React.CSSProperties;
}

export function LibrasChatPanel({
  role,
  incomingMessage,
  onMessage,
  labels,
  speed = 1.3,
  ...rest
}: LibrasChatPanelProps) {
  const [messages, setMessages] = useState<LibrasChatMessage[]>([]);
  const prevIncoming = useRef<string | undefined>(undefined);

  // Mapeamento de roles: speaker → sender (capta áudio), listener → receiver (vê avatar)
  const chatRole: LibrasChatRole = role === 'speaker' ? 'sender' : 'receiver';
  const myRole: LibrasChatRole = chatRole;
  const otherRole: LibrasChatRole = role === 'speaker' ? 'receiver' : 'sender';

  // Novo texto recebido do outro lado → adiciona ao log (guard contra duplicatas)
  useEffect(() => {
    if (!incomingMessage || incomingMessage === prevIncoming.current) return;
    prevIncoming.current = incomingMessage;
    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), from: otherRole, text: incomingMessage },
    ]);
  }, [incomingMessage, otherRole]);

  const handleSend = (text: string) => {
    setMessages((m) => [...m, { id: crypto.randomUUID(), from: myRole, text }]);
    onMessage?.(text);
  };

  const resolvedLabels: Partial<Record<LibrasChatRole, string>> = {
    sender: labels?.speaker ?? 'Professor',
    receiver: labels?.listener ?? 'Aluno',
  };

  return (
    <LibrasChat
      role={chatRole}
      messages={messages}
      onSend={handleSend}
      labels={resolvedLabels}
      speed={speed}
      {...rest}
    />
  );
}
