import type { AudioSource, ASROptions } from '../../core/asr/phrase-source';
import type { VLibrasLoaderOptions } from '../../core/vlibras-loader';

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
