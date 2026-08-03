import { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../../hooks/useChat/index.ts';
import type { PeerInfo } from '../../store/useCallStore/index.ts';
import {
  Wrap, Header, PeerCount, Messages, Msg,
  MsgSender, MsgText, MsgTs, InputRow, Textarea, SendBtn,
} from './styles.ts';

export interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  peers: PeerInfo[];
}

export function ChatPanel({ messages, onSend, peers }: ChatPanelProps) {
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const peerLabel = (fromId: string) => {
    const peer = peers.find((p) => p.id === fromId);
    return peer ? `${peer.role ?? 'peer'} (${fromId.slice(0, 6)})` : fromId.slice(0, 8);
  };

  return (
    <Wrap>
      <Header>
        <span className="material-icons" style={{ fontSize: 18 }}>chat</span>
        Chat
        {peers.length > 0 && <PeerCount>{peers.length + 1} participante(s)</PeerCount>}
      </Header>

      <Messages>
        {messages.map((msg) => (
          <Msg key={msg.id} $mine={msg.isMine}>
            {!msg.isMine && <MsgSender>{peerLabel(msg.from)}</MsgSender>}
            <MsgText $mine={msg.isMine}>{msg.text}</MsgText>
            <MsgTs>
              {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </MsgTs>
          </Msg>
        ))}
        <div ref={bottomRef} />
      </Messages>

      <InputRow>
        <Textarea
          placeholder={peers.length === 0 ? 'Aguardando participantes…' : 'Digite…'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          disabled={peers.length === 0}
        />
        <SendBtn onClick={handleSend} disabled={!text.trim() || peers.length === 0}>
          ➤
        </SendBtn>
      </InputRow>
    </Wrap>
  );
}
