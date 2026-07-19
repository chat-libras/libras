import { useCamera } from '../../hooks/useCamera';
import type { DoctorVideoProps } from '../../interfaces/DoctorVideoProps';
import './DoctorVideo.css';

// Placeholder do vídeo do médico: usa a webcam se permitida, senão um avatar fake.
// Exibe a legenda (fala reconhecida OU texto digitado) sobre o vídeo.
export function DoctorVideo({ caption, listening }: DoctorVideoProps) {
  const { videoRef, on, enable } = useCamera();

  return (
    <div className="tm__video">
      <video ref={videoRef} autoPlay playsInline muted className={on ? '' : 'tm__video--off'} />
      {!on && (
        <button className="tm__video-btn" onClick={enable}>
          👨‍⚕️ Ativar câmera (médico)
        </button>
      )}
      {(caption || listening) && (
        <div className="tm__caption">{caption || 'Ouvindo…'}</div>
      )}
    </div>
  );
}
