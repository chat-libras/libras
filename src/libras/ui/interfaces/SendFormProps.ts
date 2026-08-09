import type { ReactNode } from 'react';

export interface SendFormProps {
  placeholder: string;
  onSend: (text: string) => void;
  /** Label do botão de submit. Default: "Enviar". */
  submitLabel?: string;
  /** Conteúdo extra ao lado do botão Enviar (ex.: botão de microfone). */
  children?: ReactNode;
}
