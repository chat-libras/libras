import { useState } from 'react';
import type { SendFormProps } from '../../interfaces/SendFormProps';

export function SendForm({ placeholder, onSend, submitLabel = 'Enviar', children, className, style }: SendFormProps) {
  const [text, setText] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedText = text.trim();
    if (!trimmedText) return;
    onSend(trimmedText);
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
