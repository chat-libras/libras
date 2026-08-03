import { useEffect, useRef } from 'react';
import { useCallStore } from '../../store/useCallStore/index.ts';
import { useControlsStore } from '../../store/useControlsStore/index.ts';
import { debugBus } from '../../debug/event-bus/index.ts';

export function useMediaEffects() {
  const { localStream, ws, peerId } = useCallStore();
  const { isCameraEnabled, isMicEnabled, isSoundEnabled } = useControlsStore();

  useEffect(() => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach((t) => { t.enabled = isCameraEnabled; });
  }, [isCameraEnabled, localStream]);

  useEffect(() => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach((t) => { t.enabled = isMicEnabled; });
  }, [isMicEnabled, localStream]);

  useEffect(() => {
    document.querySelectorAll<HTMLVideoElement>('video[data-remote]')
      .forEach((v) => { v.muted = !isSoundEnabled; });
  }, [isSoundEnabled]);

  const prevRef = useRef({ isCameraEnabled, isMicEnabled });
  useEffect(() => {
    const prev = prevRef.current;
    if (prev.isCameraEnabled === isCameraEnabled && prev.isMicEnabled === isMicEnabled) return;
    prevRef.current = { isCameraEnabled, isMicEnabled };
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'media:state', from: peerId, cameraOn: isCameraEnabled, micOn: isMicEnabled }));
      debugBus.emit('socket', 'media:state', { peerId, cameraOn: isCameraEnabled, micOn: isMicEnabled });
    }
  }, [isCameraEnabled, isMicEnabled, ws, peerId]);
}
