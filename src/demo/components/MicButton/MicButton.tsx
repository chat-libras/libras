import type { MicButtonProps } from '../../interfaces/MicButtonProps';
import './MicButton.css';

// Botão que liga/desliga o microfone — simula a fala do médico.
export function MicButton({ status, listening, onStart, onStop }: MicButtonProps) {
  return (
    <button
      className={`tm__btn ${listening ? 'tm__btn--rec' : 'tm__btn--primary'}`}
      onClick={listening ? onStop : onStart}
      disabled={status === 'loading' || status === 'error'}
    >
      {listening ? '⏹ Parar microfone' : '🎤 Falar (simular médico)'}
    </button>
  );
}
