import { useCamera } from '../hooks/useCamera';

// Caixa de vídeo de um participante da chamada simulada.
//   variant="camera"      → webcam real (com botão de ativar) — o médico.
//   variant="placeholder" → caixa estática (o cliente, sem câmera na demo).
interface VideoBoxProps {
  variant: 'camera' | 'placeholder';
  label: string;
  emoji: string;
}

export function VideoBox({ variant, label, emoji }: VideoBoxProps) {
  const { videoRef, on, enable } = useCamera();

  if (variant === 'placeholder') {
    return (
      <div className="videobox videobox--placeholder">
        <div className="videobox__emoji">{emoji}</div>
        <span className="videobox__label">{label}</span>
      </div>
    );
  }

  return (
    <div className="videobox">
      <video ref={videoRef} autoPlay playsInline muted className={on ? '' : 'videobox--off'} />
      {!on && (
        <button className="videobox__btn" onClick={enable}>
          {emoji} Ativar câmera
        </button>
      )}
      <span className="videobox__label">{label}</span>
    </div>
  );
}
