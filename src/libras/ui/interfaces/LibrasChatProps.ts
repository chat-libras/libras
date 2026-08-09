import type { AudioSource, ASROptions } from '../../core/asr/phrase-source';
import type { VLibrasLoaderOptions } from '../../core/vlibras-loader';
import type { LibrasStrings } from '../strings';

/** 'sender' = quem fala/digita; 'receiver' = quem vê em Libras (participante surdo). */
export type LibrasChatRole = 'sender' | 'receiver';

export interface LibrasChatMessage {
  id: string;
  from: LibrasChatRole;
  text: string;
}

export interface LibrasChatProps {
  /**
   * Qual lado esta instância representa.
   * `'sender'` — quem fala ou digita (captura áudio, lê respostas em texto).
   * `'receiver'` — quem vê em Libras (avatar VLibras sinaliza; responde por texto).
   */
  role: LibrasChatRole;
  /** Histórico completo da conversa (controlado pelo app). */
  messages: LibrasChatMessage[];
  /** Chamado quando este lado envia uma mensagem. Ligue ao seu transporte. */
  onSend: (text: string) => void;
  /**
   * (Lado sender) De onde capturar o áudio da fala. Default: microfone.
   * Passe `{ kind: 'stream', stream }` para transcrever o áudio da chamada.
   */
  audio?: AudioSource;
  /**
   * (Lado sender) Motor de reconhecimento de fala. Default: Web Speech (grátis, pt-BR).
   * Para áudio de chamada (stream) use um provedor de nuvem:
   * `{ provider: 'custom', factory: myASRFactory }`.
   */
  asr?: ASROptions;
  /** Opções de carregamento do avatar do VLibras (usado no lado receiver). */
  vlibras?: VLibrasLoaderOptions;
  /** Velocidade da sinalização do avatar (1 = normal). Default: 1.3. */
  speed?: number;
  /** Rótulos das bolhas por papel. Default: 'Orador' / 'Libras'. */
  labels?: Partial<Record<LibrasChatRole, string>>;
  /**
   * Textos da UI (botões, placeholders, estados). Sobrescreva para i18n ou
   * rebranding sem modificar o componente.
   */
  strings?: LibrasStrings;
  className?: string;
  style?: React.CSSProperties;
}
