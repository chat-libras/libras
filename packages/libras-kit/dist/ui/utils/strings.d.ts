export interface LibrasStrings {
    /** "Carregando avatar…" */
    avatarLoading?: string;
    /** "Digitar frase…" — placeholder do input de texto em LibrasTranslator */
    captionPlaceholder?: string;
    /** "▶ Traduzir" — botão iniciar ASR */
    buttonTranslate?: string;
    /** "⏹ Parar" — botão parar ASR */
    buttonStop?: string;
    /** "Traduzir texto" — botão de submit do input de texto */
    buttonSubmitText?: string;
    /** "Ajustar a velocidade do avatar" — title do botão de velocidade */
    buttonSpeedLabel?: string;
    /** "Enviar" — botão de submit do chat */
    chatSendButton?: string;
    /** "Digite sua mensagem…" — placeholder do lado sender (quem fala/digita) */
    chatSenderPlaceholder?: string;
    /** "Responder…" — placeholder do lado receiver (quem vê em Libras) */
    chatReceiverPlaceholder?: string;
    /** "🎤 Falar" — botão ligar microfone */
    chatMicStart?: string;
    /** "⏹ Parar" — botão desligar microfone */
    chatMicStop?: string;
    /** "Avatar de Libras" — aria-label do container do avatar */
    avatarAriaLabel?: string;
}
export declare const DEFAULT_STRINGS: Required<LibrasStrings>;
export declare function resolveStrings(strings?: LibrasStrings): Required<LibrasStrings>;
