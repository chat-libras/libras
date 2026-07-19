import { useRef, useState } from 'react';
import { getCameraStream } from '../utils/getCameraStream';

// Gerencia a webcam do vídeo do médico: expõe o ref do <video>, se está ligada
// e uma ação para ativá-la (mantém o placeholder se não houver câmera/permissão).
export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [on, setOn] = useState(false);

  const enable = async () => {
    const stream = await getCameraStream();
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      setOn(true);
    }
  };

  return { videoRef, on, enable };
}
