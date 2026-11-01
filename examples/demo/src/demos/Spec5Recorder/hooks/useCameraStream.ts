import { useEffect, useRef, useState } from 'react';

export interface CameraStreamApi {
  videoRef:   React.RefObject<HTMLVideoElement>;
  streamRef:  React.RefObject<MediaStream | null>;
  cameraOn:   boolean;
  enableCamera: () => Promise<void>;
}

export function useCameraStream(): CameraStreamApi {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);

  const enableCamera = async () => {
    const tryGet = (constraints: MediaStreamConstraints) =>
      navigator.mediaDevices.getUserMedia(constraints).catch(() => null);

    const stream =
      (await tryGet({ video: true, audio: true })) ??
      (await tryGet({ video: true }));

    if (!stream) {
      alert('Não foi possível acessar a câmera. Verifique as permissões.');
      return;
    }
    streamRef.current = stream;
    if (videoRef.current) videoRef.current.srcObject = stream;
    setCameraOn(true);
  };

  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, []);

  return { videoRef, streamRef, cameraOn, enableCamera };
}
