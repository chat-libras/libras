import { useManualPhrase } from '../../hooks/useManualPhrase';
import type { ManualFormProps } from '../../interfaces/ManualFormProps';
import './ManualForm.css';

// Formulário para digitar uma frase e traduzi-la manualmente (sem áudio).
export function ManualForm({ status, onTranslate }: ManualFormProps) {
  const { phrase, setPhrase, submit } = useManualPhrase(onTranslate);

  return (
    <form
      className="tm__manual"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <input
        value={phrase}
        onChange={(e) => setPhrase(e.target.value)}
        placeholder="Digitar frase…"
      />
      <button type="submit" disabled={status === 'loading'}>
        Traduzir texto
      </button>
    </form>
  );
}
