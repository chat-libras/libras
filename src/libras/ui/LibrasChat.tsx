import { SenderSide } from './components/SenderSide/SenderSide';
import { ReceiverSide } from './components/ReceiverSide/ReceiverSide';
import { resolveLabels } from './utils/messages';
import { resolveStrings } from './strings';
import { useLibrasConfig } from './LibrasProvider';
import type { LibrasChatProps } from './interfaces/LibrasChatProps';
import type { AudioSource, ASROptions } from '../core/asr/phrase-source';
import './LibrasChat.css';

// ---------------------------------------------------------------------------
// <LibrasChat> — chat assimétrico de acessibilidade, agnóstico de domínio e
// de transporte. Funciona em qualquer videochamada (saúde, educação, suporte).
//
//   role="sender"   → fala (captura de áudio) ou digita; lê respostas em texto.
//   role="receiver" → vê as mensagens sinalizadas pelo avatar VLibras; responde
//                     por texto.
//
// O componente é *controlado*: você passa o histórico (`messages`) e recebe
// cada envio em `onSend`. Ligue ao seu transporte (WebSocket, Firebase, etc.).
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
  strings: stringsProp,
  className,
  style,
}: LibrasChatProps) {
  const ctx = useLibrasConfig();
  const resolvedLabels = resolveLabels(labels);
  const resolvedStrings = resolveStrings({ ...ctx.strings, ...stringsProp });

  // Props locais têm prioridade; fallback para o LibrasProvider; último fallback: defaults.
  const resolvedAudio: AudioSource = audio ?? ctx.audio ?? { kind: 'microphone' };
  const resolvedAsr: ASROptions = asr ?? ctx.asr ?? { provider: 'webspeech', lang: 'pt-BR' };
  const resolvedVlibras = vlibras ?? ctx.vlibras;

  return (
    <section className={`libras-chat ${className ?? ''}`} style={style}>
      {role === 'sender' ? (
        <SenderSide
          messages={messages}
          onSend={onSend}
          labels={resolvedLabels}
          audio={resolvedAudio}
          asr={resolvedAsr}
          strings={resolvedStrings}
        />
      ) : (
        <ReceiverSide
          messages={messages}
          onSend={onSend}
          labels={resolvedLabels}
          vlibras={resolvedVlibras}
          speed={speed}
          strings={resolvedStrings}
        />
      )}
    </section>
  );
}
