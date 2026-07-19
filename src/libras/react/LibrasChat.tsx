import { useEffect, useRef, useState } from 'react';
import { useLibrasAvatar } from './useLibrasAvatar';
import {
  createPhraseSource,
  type AudioSource,
  type ASROptions,
  type PhraseSource,
} from '../core/asr/phrase-source';
import type { VLibrasLoaderOptions } from '../core/vlibras-loader';

// ---------------------------------------------------------------------------
// <LibrasChat> — chat assimétrico de acessibilidade, pronto para embutir em
// qualquer app (telemedicina, atendimento, suporte).
//
//   role="doctor"  (ouvinte) → fala (captura de áudio) ou escreve; lê as
//                              respostas do outro lado em texto. A captura de
//                              áudio é plugável (Web Speech grátis por padrão,
//                              ou um provedor de nuvem via `asr`/`audio`).
//   role="client"  (surdo)   → vê as mensagens do médico sinalizadas pelo
//                              avatar do VLibras; responde por texto.
//
// O componente é *controlado* e agnóstico de transporte: você passa o histórico
// (`messages`) e recebe cada envio em `onSend`. Ligue `onSend`/`messages` ao seu
// canal real (Vonage `session.signal()`, WebSocket, Firebase, etc.). Assim a
// mesma peça serve para os dois lados, em máquinas diferentes.
//
//   const [msgs, setMsgs] = useState<LibrasChatMessage[]>([]);
//   <LibrasChat role="doctor" messages={msgs} onSend={sendToPeer} />
// ---------------------------------------------------------------------------

export type LibrasChatRole = 'doctor' | 'client';

export interface LibrasChatMessage {
  id: string;
  from: LibrasChatRole;
  text: string;
}

export interface LibrasChatProps {
  /** Qual lado esta instância representa. */
  role: LibrasChatRole;
  /** Histórico completo da conversa (controlado pelo app). */
  messages: LibrasChatMessage[];
  /** Chamado quando este lado envia uma mensagem. Ligue ao seu transporte. */
  onSend: (text: string) => void;
  /**
   * (Lado médico) De onde capturar o áudio da fala. Default: microfone.
   * Passe `{ kind: 'stream', stream }` para transcrever o áudio da chamada.
   */
  audio?: AudioSource;
  /**
   * (Lado médico) Motor de reconhecimento de fala. Default: Web Speech (grátis,
   * pt-BR). Para áudio de chamada (stream) use um provedor de nuvem, ex.:
   * `{ provider: 'deepgram', apiKey }`.
   */
  asr?: ASROptions;
  /** Opções de carregamento do avatar do VLibras (usado no lado cliente). */
  vlibras?: VLibrasLoaderOptions;
  /** Velocidade da sinalização do avatar (1 = normal). Default: 1.3. */
  speed?: number;
  /** Rótulos das bolhas por papel. Default: Médico / Cliente. */
  labels?: Partial<Record<LibrasChatRole, string>>;
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_LABELS: Record<LibrasChatRole, string> = {
  doctor: 'Médico',
  client: 'Cliente',
};

// --- Log de mensagens (bolhas), reusado pelos dois lados. ------------------
function ChatLog({
  messages,
  mine,
  labels,
}: {
  messages: LibrasChatMessage[];
  mine: LibrasChatRole;
  labels: Record<LibrasChatRole, string>;
}) {
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

// --- Formulário de envio de texto (reusado pelos dois lados). --------------
function SendForm({
  placeholder,
  onSend,
  children,
}: {
  placeholder: string;
  onSend: (text: string) => void;
  children?: React.ReactNode;
}) {
  const [text, setText] = useState('');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText('');
  };
  return (
    <form className="libras-chat__form" onSubmit={submit}>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} />
      <button type="submit">Enviar</button>
      {children}
    </form>
  );
}

// --- Lado MÉDICO: captura áudio (fala) OU escreve; lê respostas em texto. ---
// A captura de áudio é plugável via `createPhraseSource` (Web Speech grátis por
// padrão, ou um provedor de nuvem); a frase reconhecida vira mensagem no chat.
function DoctorSide({
  messages,
  onSend,
  labels,
  audio,
  asr,
}: {
  messages: LibrasChatMessage[];
  onSend: (text: string) => void;
  labels: Record<LibrasChatRole, string>;
  audio: AudioSource;
  asr: ASROptions;
}) {
  const [interim, setInterim] = useState('');
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sourceRef = useRef<PhraseSource | null>(null);

  const toggleMic = () => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
      return;
    }
    setError(null);
    const source = createPhraseSource(audio, asr, {
      onPhrase: (t) => {
        onSend(t);
        setInterim('');
      },
      onInterim: setInterim,
      onListening: setListening,
      onError: (e) => {
        setError(e);
        setInterim('');
      },
    });
    sourceRef.current = source;
    source.start().catch((e) => setError(String(e?.message ?? e)));
  };

  useEffect(() => () => sourceRef.current?.stop(), []);

  return (
    <>
      <ChatLog messages={messages} mine="doctor" labels={labels} />
      {interim && <div className="libras-chat__interim">🎤 {interim}…</div>}
      {error && <div className="libras-chat__error">{error}</div>}
      <SendForm placeholder="Escrever para o cliente…" onSend={onSend}>
        <button
          type="button"
          onClick={toggleMic}
          className={listening ? 'libras-chat__mic libras-chat__mic--on' : 'libras-chat__mic'}
        >
          {listening ? '⏹ Parar' : '🎤 Falar'}
        </button>
      </SendForm>
    </>
  );
}

// --- Lado CLIENTE (surdo): avatar sinaliza as falas do médico; responde texto.
function ClientSide({
  messages,
  onSend,
  labels,
  vlibras,
  speed,
}: {
  messages: LibrasChatMessage[];
  onSend: (text: string) => void;
  labels: Record<LibrasChatRole, string>;
  vlibras?: VLibrasLoaderOptions;
  speed: number;
}) {
  // O avatar só renderiza e sinaliza texto — não captura áudio.
  const avatar = useLibrasAvatar({ speed, vlibras });
  const seen = useRef(0);

  // Cada nova mensagem DO MÉDICO → o avatar sinaliza para o cliente.
  useEffect(() => {
    for (let i = seen.current; i < messages.length; i++) {
      if (messages[i].from === 'doctor') avatar.translate(messages[i].text);
    }
    seen.current = messages.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  return (
    <>
      <div ref={avatar.containerRef} className="libras-chat__stage" />
      {avatar.status === 'loading' && <div className="libras-chat__interim">Carregando avatar…</div>}
      {avatar.status === 'error' && <div className="libras-chat__error">{avatar.error}</div>}

      <ChatLog messages={messages} mine="client" labels={labels} />

      {/* O chat de texto sempre funciona, mesmo com o avatar carregando/falho. */}
      <SendForm placeholder="Responder ao médico…" onSend={onSend} />
    </>
  );
}

export function LibrasChat({
  role,
  messages,
  onSend,
  audio,
  asr,
  vlibras,
  speed = 1.3,
  labels,
  className,
  style,
}: LibrasChatProps) {
  useChatStyles();
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  // Lado médico: microfone + Web Speech (grátis) por padrão; sobrescreva via props.
  const resolvedAudio: AudioSource = audio ?? { kind: 'microphone' };
  const resolvedAsr: ASROptions = asr ?? { provider: 'webspeech', lang: 'pt-BR' };

  return (
    <section className={`libras-chat ${className ?? ''}`} style={style}>
      {role === 'doctor' ? (
        <DoctorSide
          messages={messages}
          onSend={onSend}
          labels={resolvedLabels}
          audio={resolvedAudio}
          asr={resolvedAsr}
        />
      ) : (
        <ClientSide
          messages={messages}
          onSend={onSend}
          labels={resolvedLabels}
          vlibras={vlibras}
          speed={speed}
        />
      )}
    </section>
  );
}

// --- Estilos padrão, injetados uma única vez; sobrescreva via className. ----
const STYLE_ID = 'libras-chat-styles';
function useChatStyles() {
  useEffect(() => {
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = CHAT_CSS;
    document.head.appendChild(el);
  }, []);
}

const CHAT_CSS = `
.libras-chat { display: flex; flex-direction: column; gap: 10px; font-family: system-ui, sans-serif; }
.libras-chat__stage { width: 100%; aspect-ratio: 4/3; background: #111; border-radius: 10px; }
.libras-chat__log { height: 220px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; padding: 6px; background: #fff; border-radius: 8px; border: 1px solid #eee; }
.libras-chat__bubble { max-width: 85%; padding: 6px 10px; border-radius: 10px; background: #eef1f4; color: #000; font-size: 14px; align-self: flex-start; }
.libras-chat__bubble--mine { align-self: flex-end; background: #d7ebff; }
.libras-chat__who { display: block; font-size: 10px; color: #888; text-transform: uppercase; }
.libras-chat__interim { color: #a60; font-size: 13px; }
.libras-chat__error { color: crimson; font-size: 13px; }
.libras-chat__form { display: flex; gap: 6px; }
.libras-chat__form input { flex: 1; padding: 8px; }
.libras-chat__form button { padding: 8px 12px; cursor: pointer; }
.libras-chat__mic--on { background: #ffd7d7; }
`;
