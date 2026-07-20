import { useState } from 'react';
import type { SendFormProps } from '../../interfaces/SendFormProps';
import './SendForm.css';

// Formulário de envio de texto (reusado pelos dois lados). `children` permite
// adicionar controles ao lado do botão Enviar (ex.: o microfone do médico).
export function SendForm({ placeholder, onSend, children }: SendFormProps) {
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
