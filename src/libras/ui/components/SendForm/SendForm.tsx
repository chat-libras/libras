import { useState } from 'react';
import type { SendFormProps } from '../../interfaces/SendFormProps';
import './SendForm.css';

export function SendForm({ placeholder, onSend, submitLabel = 'Enviar', children, className, style }: SendFormProps) {
  const [text, setText] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText('');
  };

  return (
    <form className={`libras-chat__form${className ? ` ${className}` : ''}`} style={style} onSubmit={submit}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      <button type="submit">{submitLabel}</button>
      {children}
    </form>
  );
}
