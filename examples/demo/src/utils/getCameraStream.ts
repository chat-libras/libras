// Pede acesso à webcam e devolve o MediaStream, ou null se não houver câmera /
// permissão for negada (mantém o placeholder do vídeo).
export async function getCameraStream(): Promise<MediaStream | null> {
  try {
    return await navigator.mediaDevices.getUserMedia({ video: true });
  } catch {
    return null;
  }
}
