import { useEffect, useRef, useState } from 'react';
import type { Preset, PresetId } from '../presets';

interface UseRecorderOptions {
  preset:              Preset;
  presetId:            PresetId;
  webcamVideoRef:      React.RefObject<HTMLVideoElement>;
  webcamStreamRef:     React.RefObject<MediaStream | null>;
  avatarContainerRef:  React.RefObject<HTMLDivElement | null>;
}

// Funções de draw puras — recebem ctx e dimensões, não dependem de estado.
function drawCover(
  ctx: CanvasRenderingContext2D,
  src: HTMLVideoElement,
  dx: number, dy: number, dw: number, dh: number,
) {
  const { videoWidth: sw, videoHeight: sh } = src;
  if (!sw || !sh) return;
  const scale = Math.max(dw / sw, dh / sh);
  ctx.save();
  ctx.beginPath(); ctx.rect(dx, dy, dw, dh); ctx.clip();
  ctx.drawImage(src, dx + (dw - sw * scale) / 2, dy + (dh - sh * scale) / 2, sw * scale, sh * scale);
  ctx.restore();
}

function drawContain(
  ctx: CanvasRenderingContext2D,
  src: HTMLVideoElement,
  dx: number, dy: number, dw: number, dh: number,
) {
  const { videoWidth: sw, videoHeight: sh } = src;
  if (!sw || !sh) return;
  const scale = Math.min(dw / sw, dh / sh);
  ctx.drawImage(src, dx + (dw - sw * scale) / 2, dy + (dh - sh * scale) / 2, sw * scale, sh * scale);
}

function drawFitHeight(
  ctx: CanvasRenderingContext2D,
  src: HTMLVideoElement,
  dx: number, dy: number, dw: number, dh: number,
) {
  const { videoWidth: sw, videoHeight: sh } = src;
  if (!sw || !sh) return;
  const scale = dh / sh;
  ctx.drawImage(src, dx + (dw - sw * scale) / 2, dy, sw * scale, dh);
}

export function useRecorder({
  preset,
  presetId,
  webcamVideoRef,
  webcamStreamRef,
  avatarContainerRef,
}: UseRecorderOptions) {
  const recorderRef    = useRef<MediaRecorder | null>(null);
  const rafRef         = useRef<number>(0);
  const chunksRef      = useRef<Blob[]>([]);
  const avatarPipeRef  = useRef<HTMLVideoElement | null>(null);
  const extraAudioRef  = useRef<MediaStream | null>(null);

  const [recording, setRecording] = useState(false);

  const startRecording = async () => {
    const webcam = webcamVideoRef.current;
    const avatarCanvas = avatarContainerRef.current?.querySelector('canvas') as HTMLCanvasElement | null;
    if (!webcam || !avatarCanvas) return;

    if (!avatarPipeRef.current) {
      const vid = document.createElement('video');
      vid.srcObject = avatarCanvas.captureStream(30);
      vid.muted = true;
      vid.play().catch(() => {});
      avatarPipeRef.current = vid;
    }

    let audioTracks = (webcamStreamRef.current?.getAudioTracks() ?? []).filter((t) => t.readyState === 'live');
    if (audioTracks.length === 0) {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
      if (audioStream) {
        extraAudioRef.current = audioStream;
        audioTracks = audioStream.getAudioTracks();
      }
    }

    const { canvasW, canvasH, avatarPct, drawMode } = preset;
    const canvas = document.createElement('canvas');
    canvas.width = canvasW; canvas.height = canvasH;
    const ctx = canvas.getContext('2d')!;

    const AW     = Math.round(canvasW * avatarPct);
    const AH     = Math.round(AW * (3 / 4));
    const PAD    = Math.round(AW * 0.015);
    const MARGIN = Math.round(canvasW * 0.02);
    const BOX_W  = AW + PAD * 2;
    const BOX_H  = AH + PAD * 2;
    const BOX_X  = canvasW - BOX_W - MARGIN;
    const BOX_Y  = canvasH - BOX_H - MARGIN;
    const RADIUS = Math.round(AW * 0.04);

    const drawBackground = drawMode === 'fitHeight' ? drawFitHeight : drawCover;

    const draw = () => {
      ctx.fillStyle = '#0a0c14';
      ctx.fillRect(0, 0, canvasW, canvasH);
      if (webcam.readyState >= 2) drawBackground(ctx, webcam, 0, 0, canvasW, canvasH);

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      const ctxExt = ctx as unknown as { roundRect?: (x: number, y: number, w: number, h: number, r: number) => void };
      if (typeof ctxExt.roundRect === 'function') {
        ctxExt.roundRect(BOX_X, BOX_Y, BOX_W, BOX_H, RADIUS);
      } else {
        ctx.rect(BOX_X, BOX_Y, BOX_W, BOX_H);
      }
      ctx.fill();

      const pipe = avatarPipeRef.current;
      if (pipe && pipe.readyState >= 2) drawContain(ctx, pipe, BOX_X + PAD, BOX_Y + PAD, AW, AH);

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    const fullStream = new MediaStream([...canvas.captureStream(30).getTracks(), ...audioTracks]);
    const mimeType   = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
      ? 'video/webm;codecs=vp8,opus' : 'video/webm';

    const recorder = new MediaRecorder(fullStream, { mimeType });
    chunksRef.current = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `libras-${presetId}-${Date.now()}.webm`; a.click();
      URL.revokeObjectURL(url);
    };
    recorder.start(200);
    recorderRef.current = recorder;
    setRecording(true);
  };

  const stopRecording = () => {
    cancelAnimationFrame(rafRef.current);
    recorderRef.current?.stop();
    recorderRef.current = null;
    extraAudioRef.current?.getTracks().forEach((t) => t.stop());
    extraAudioRef.current = null;
    setRecording(false);
  };

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      recorderRef.current?.stop();
      extraAudioRef.current?.getTracks().forEach((t) => t.stop());
      avatarPipeRef.current?.pause();
    };
  }, []);

  return { recording, startRecording, stopRecording };
}
