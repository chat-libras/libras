import { DoctorSide } from './components/DoctorSide/DoctorSide';
import { ClientSide } from './components/ClientSide/ClientSide';
import { resolveLabels } from './utils/messages';
import type { LibrasChatProps } from './interfaces/LibrasChatProps';
import type { AudioSource, ASROptions } from '../core/asr/phrase-source';
import './LibrasChat.css';

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
//
// Esta camada só orquestra: escolhe o lado pelo `role` e resolve os defaults.
// Cada componente importa o próprio `.css`; a lógica de cada lado vive em
// `./components/*` (view), `./hooks/*` (comportamento) e `./utils/*` (puro).
// ---------------------------------------------------------------------------

// Re-exporta os tipos públicos (a implementação mora em `./interfaces`).
export type {
  LibrasChatProps,
  LibrasChatMessage,
  LibrasChatRole,
} from './interfaces/LibrasChatProps';

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
  const resolvedLabels = resolveLabels(labels);
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
