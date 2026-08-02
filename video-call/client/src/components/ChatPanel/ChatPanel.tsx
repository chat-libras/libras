import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import type { ChatMessage } from '../../hooks/useChat.ts';
import type { PeerInfo } from '../../hooks/useWebRTC.ts';

export interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  peers: PeerInfo[];
}

// ── Styled ────────────────────────────────────────────────────────────────────

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 10px 12px;
  background: ${({ theme }) => theme.bg.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  font-weight: 600;
  font-size: 13px;
  color: ${({ theme }) => theme.text.primary};
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  min-height: 42px;
  flex-shrink: 0;
`;

const PeerCount = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.text.secondary};
`;

const Messages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Msg = styled.div<{ $mine: boolean }>`
  display: flex;
  flex-direction: column;
  max-width: 85%;
  gap: 2px;
  align-self: ${({ $mine }) => ($mine ? 'flex-end' : 'flex-start')};
  align-items: ${({ $mine }) => ($mine ? 'flex-end' : 'flex-start')};
`;

const MsgSender = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme.text.muted};
`;

const MsgText = styled.span<{ $mine: boolean }>`
  padding: 7px 10px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.4;
  word-break: break-word;
  background: ${({ $mine, theme }) => $mine ? theme.chat.mine.bg : theme.chat.theirs.bg};
  color: ${({ $mine, theme }) => $mine ? theme.chat.mine.color : theme.chat.theirs.color};
`;

const MsgTs = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme.text.muted};
`;

const InputRow = styled.div`
  display: flex;
  gap: 6px;
  padding: 10px;
  border-top: 1px solid ${({ theme }) => theme.border};
  flex-shrink: 0;
`;

const Textarea = styled.textarea`
  flex: 1;
  background: ${({ theme }) => theme.chat.input};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  color: ${({ theme }) => theme.text.primary};
  padding: 8px 10px;
  font-size: 13px;
  resize: none;
  font-family: inherit;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
  &::placeholder { color: ${({ theme }) => theme.text.muted}; }
`;

const SendBtn = styled.button`
  width: 36px;
  height: 36px;
  background: ${({ theme }) => theme.btn.active.bg};
  border: none;
  border-radius: 6px;
  color: ${({ theme }) => theme.btn.active.text};
  cursor: pointer;
  font-size: 16px;
  align-self: flex-end;
  transition: opacity 0.15s;
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

// ── Component ─────────────────────────────────────────────────────────────────

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
