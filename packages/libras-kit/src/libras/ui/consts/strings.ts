export interface LibrasStrings {
  /** "Carregando avatar…" */
  avatarLoading?: string;
  /** "Avatar de Libras" — aria-label do container do avatar */
  avatarAriaLabel?: string;
  /** "Digitar frase…" — placeholder do input de texto */
  inputPlaceholder?: string;
  /** "Enviar" — botão de submit */
  inputSendButton?: string;
  /** "🎤 Ouvir" — botão iniciar microfone */
  micStart?: string;
  /** "⏹ Parar" — botão parar microfone */
  micStop?: string;
}

export const DEFAULT_STRINGS: Required<LibrasStrings> = {
  avatarLoading: 'Carregando avatar…',
  avatarAriaLabel: 'Avatar de Libras',
  inputPlaceholder: 'Digite uma mensagem…',
  inputSendButton: 'Enviar',
  micStart: '🎤 Ouvir',
  micStop: '⏹ Parar',
};

export function resolveStrings(overrides?: Partial<LibrasStrings>): Required<LibrasStrings> {
  return { ...DEFAULT_STRINGS, ...overrides };
}
