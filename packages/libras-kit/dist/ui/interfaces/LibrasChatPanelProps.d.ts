import { AudioSource, ASROptions } from '../../core/asr/phrase-source';
import { VLibrasLoaderOptions } from '../../core/vlibras-loader';
import { LibrasStrings } from '../utils/strings';
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
    labels?: {
        speaker?: string;
        listener?: string;
    };
    /** Textos da UI (botões, placeholders). Sobrescreva para i18n ou rebranding. */
    strings?: LibrasStrings;
    className?: string;
    style?: React.CSSProperties;
}
