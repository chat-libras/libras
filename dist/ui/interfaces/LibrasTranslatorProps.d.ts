import { UseLibrasTranslatorOptions } from '../hooks/useLibrasTranslator';
import { LibrasStrings } from '../utils/strings';
/** Quais controles embutidos exibir. `true` = todos. */
export type LibrasControls = boolean | {
    /** Botão iniciar/parar a tradução do áudio. */
    start?: boolean;
    /** Campo para digitar e sinalizar um texto (sem áudio). */
    text?: boolean;
    /** Botão para ciclar a velocidade da sinalização. */
    speed?: boolean;
};
export interface LibrasTranslatorProps extends UseLibrasTranslatorOptions {
    className?: string;
    style?: React.CSSProperties;
    /** Mostra a transcrição parcial sobre o avatar. */
    showCaptions?: boolean;
    /**
     * Controles embutidos (start/parar, velocidade, input de texto).
     * Ligado por padrão; `false` esconde, ou um objeto escolhe quais.
     */
    controls?: LibrasControls;
    /**
     * Textos da UI (botões, placeholders, estados). Sobrescreva para i18n ou
     * rebranding sem modificar o componente.
     */
    strings?: LibrasStrings;
}
