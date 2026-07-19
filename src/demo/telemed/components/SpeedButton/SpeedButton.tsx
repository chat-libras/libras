import type { SpeedButtonProps } from '../../interfaces/SpeedButtonProps';

// Botão que aumenta a velocidade da sinalização do avatar, em passos, com
// retorno ao início ao atingir o máximo (ciclo).
const STEP = 0.25;
const MIN = 1;
const MAX = 2;

export function SpeedButton({ status, speed, onSetSpeed }: SpeedButtonProps) {
  const next = () => {
    const value = speed >= MAX ? MIN : Math.round((speed + STEP) * 100) / 100;
    onSetSpeed(value);
  };

  return (
    <button
      className="tm__btn"
      onClick={next}
      disabled={status === 'loading' || status === 'error'}
      title="Aumentar a velocidade do avatar"
    >
      ⏩ Velocidade {speed.toFixed(2)}×
    </button>
  );
}
