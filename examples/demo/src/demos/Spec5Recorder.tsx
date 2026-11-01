import { useCallback, useEffect, useRef, useState } from 'react';
import { useLibrasTranslator } from 'libras-translator';

const PRESETS = [
  { id: 'youtube', label: 'YouTube',        note: '16:9', canvasW: 1280, canvasH: 720,  avatarPct: 0.25, drawMode: 'cover'     },
  { id: 'reels',   label: 'Reels / TikTok', note: '9:16', canvasW: 1280,  canvasH: 1280, avatarPct: 0.40, drawMode: 'fitHeight' },
  { id: 'square',  label: 'Feed',           note: '1:1',  canvasW: 720,  canvasH: 720,  avatarPct: 0.28, drawMode: 'cover'     },
] as const;

type PresetId = typeof PRESETS[number]['id'];

const ASPECT: Record<PresetId, string> = {
  youtube: '16 / 9',
  reels:   '9 / 16',
  square:  '1 / 1',
};

export function Spec5Recorder() {
  const webcamRef        = useRef<HTMLVideoElement>(null);
  const webcamStreamRef  = useRef<MediaStream | null>(null);
  const containerElRef   = useRef<HTMLDivElement | null>(null);
  const stageRef         = useRef<HTMLDivElement>(null);
  const recorderRef      = useRef<MediaRecorder | null>(null);
  const rafRef           = useRef<number>(0);
  const chunksRef        = useRef<Blob[]>([]);
  const avatarPipeRef    = useRef<HTMLVideoElement | null>(null);
  const extraAudioRef    = useRef<MediaStream | null>(null);
  // Texto atual sendo traduzido — lido no draw loop via ref (sem re-render)
  const transcriptRef    = useRef('');

  const [cameraOn,     setCameraOn]     = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [recording,    setRecording]    = useState(false);
  const [presetId,     setPresetId]     = useState<PresetId>('youtube');

  const preset = PRESETS.find((p) => p.id === presetId)!;

  const libras = useLibrasTranslator({
    audio: { kind: 'microphone' },
    autoStart: false,
    speed: 3,
    onTranscript: (text) => { transcriptRef.current = text; },
  });

  const containerCallback = useCallback(
    (el: HTMLDivElement | null) => {
      containerElRef.current = el;
      libras.containerRef(el);
    },
    [libras.containerRef],
  );

  useEffect(() => {
    if (libras.status === 'ready') libras.setSpeed(3);
  }, [libras.status, libras.setSpeed]);

  // Sync interim para ref — usado no draw loop da gravação
  const interimRef = useRef('');
  useEffect(() => { interimRef.current = libras.interim; }, [libras.interim]);

  const enableCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      webcamStreamRef.current = stream;
      if (webcamRef.current) webcamRef.current.srcObject = stream;
      setCameraOn(true);
    } catch {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        webcamStreamRef.current = stream;
        if (webcamRef.current) webcamRef.current.srcObject = stream;
        setCameraOn(true);
      } catch {
        alert('Não foi possível acessar a câmera. Verifique as permissões.');
      }
    }
  };

  const toggleFullscreen = () => setIsFullscreen((f) => !f);

  const startRecording = async () => {
    const webcam = webcamRef.current;
    const avatarCanvas = containerElRef.current?.querySelector('canvas') as HTMLCanvasElement | null;
    if (!webcam || !avatarCanvas) return;

    if (!avatarPipeRef.current) {
      const stream = avatarCanvas.captureStream(30);
      const vid = document.createElement('video');
      vid.srcObject = stream; vid.muted = true;
      vid.play().catch(() => {});
      avatarPipeRef.current = vid;
    }

    let audioTracks = (webcamStreamRef.current?.getAudioTracks() ?? [])
      .filter((t) => t.readyState === 'live');
    if (audioTracks.length === 0) {
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        extraAudioRef.current = audioStream;
        audioTracks = audioStream.getAudioTracks();
      } catch { /* grava sem áudio */ }
    }

    const { canvasW, canvasH, avatarPct, drawMode } = preset;
    const canvas = document.createElement('canvas');
    canvas.width = canvasW; canvas.height = canvasH;
    const ctx = canvas.getContext('2d')!;

    const AW     = Math.round(canvasW * avatarPct);
    const AH     = Math.round(AW * (3 / 4));
    const PAD    = Math.round(AW * 0.015);
    const BOX_W  = AW + PAD * 2;
    const BOX_H  = AH + PAD * 2;
    const MARGIN = Math.round(canvasW * 0.02);
    const BOX_X  = canvasW - BOX_W - MARGIN;
    const BOX_Y  = canvasH - BOX_H - MARGIN;
    const RADIUS = Math.round(AW * 0.04);

    // object-fit: cover — câmera de fundo
    const drawCover = (src: HTMLVideoElement, dx: number, dy: number, dw: number, dh: number) => {
      const sw = src.videoWidth, sh = src.videoHeight;
      if (!sw || !sh) return;
      const scale = Math.max(dw / sw, dh / sh);
      ctx.save();
      ctx.beginPath(); ctx.rect(dx, dy, dw, dh); ctx.clip();
      ctx.drawImage(src,
        dx + (dw - sw * scale) / 2,
        dy + (dh - sh * scale) / 2,
        sw * scale, sh * scale);
      ctx.restore();
    };

    // object-fit: contain — avatar centralizado, sem cortar
    const drawContain = (src: HTMLVideoElement, dx: number, dy: number, dw: number, dh: number) => {
      const sw = src.videoWidth, sh = src.videoHeight;
      if (!sw || !sh) return;
      const scale   = Math.min(dw / sw, dh / sh);
      const scaledW = sw * scale;
      const scaledH = sh * scale;
      ctx.drawImage(src, dx + (dw - scaledW) / 2, dy + (dh - scaledH) / 2, scaledW, scaledH);
    };

    // Encaixa pela altura (Reels) — câmera inteira visível, barras nas laterais
    const drawFitHeight = (src: HTMLVideoElement, dx: number, dy: number, dw: number, dh: number) => {
      const sw = src.videoWidth, sh = src.videoHeight;
      if (!sw || !sh) return;
      const scale = dh / sh;
      ctx.drawImage(src, dx + (dw - sw * scale) / 2, dy, sw * scale, dh);
    };

    const drawSrc = drawMode === 'fitHeight' ? drawFitHeight : drawCover;

    const draw = () => {
      // Fundo: câmera
      ctx.fillStyle = '#0a0c14';
      ctx.fillRect(0, 0, canvasW, canvasH);
      if (webcam.readyState >= 2) drawSrc(webcam, 0, 0, canvasW, canvasH);

      // Caixa branca com cantos arredondados
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      if ('roundRect' in ctx) {
        (ctx as CanvasRenderingContext2D & { roundRect: Function }).roundRect(BOX_X, BOX_Y, BOX_W, BOX_H, RADIUS);
      } else {
        ctx.rect(BOX_X, BOX_Y, BOX_W, BOX_H);
      }
      ctx.fill();

      // Avatar centralizado dentro da caixa
      const pipe = avatarPipeRef.current;
      if (pipe && pipe.readyState >= 2) {
        drawContain(pipe, BOX_X + PAD, BOX_Y + PAD, AW, AH);
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    const videoTracks = canvas.captureStream(30).getTracks();
    const fullStream  = new MediaStream([...videoTracks, ...audioTracks]);
    const mimeType    = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
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

  // Esc fecha o fullscreen CSS
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsFullscreen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      recorderRef.current?.stop();
      webcamStreamRef.current?.getTracks().forEach((t) => t.stop());
      extraAudioRef.current?.getTracks().forEach((t) => t.stop());
      avatarPipeRef.current?.pause();
    };
  }, []);

  const canRecord = cameraOn && (libras.status === 'ready' || libras.status === 'listening');

  return (
    <div
      ref={stageRef}
      className={`cam-stage ${isFullscreen ? 'cam-stage--fullscreen' : ''}`}
      style={isFullscreen ? undefined : { aspectRatio: ASPECT[presetId] }}
    >
      <video
        ref={webcamRef}
        className={`cam-stage__feed ${cameraOn ? '' : 'cam-stage__feed--hidden'}`}
        autoPlay playsInline muted
      />

      {!cameraOn && (
        <div className="cam-stage__placeholder">
          <span className="cam-stage__emoji">🙂</span>
          <p className="cam-stage__hint">Ligue a câmera para começar</p>
          <button className="spec__btn" onClick={enableCamera}>Ligar câmera</button>
        </div>
      )}

      <div ref={containerCallback} className="cam-stage__avatar" />

      <div className="cam-stage__bar">
        <span className={`spec__badge spec__badge--${libras.status}`}>{libras.status}</span>

        {cameraOn && (
          libras.listening
            ? <button className="cam-stage__btn cam-stage__btn--stop" onClick={libras.stop}>⏹ Mic</button>
            : <button className="cam-stage__btn" onClick={libras.start} disabled={libras.status === 'loading'}>🎤 Mic</button>
        )}

        <div className="cam-stage__presets">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              className={`cam-stage__preset ${presetId === p.id ? 'cam-stage__preset--active' : ''}`}
              onClick={() => setPresetId(p.id)}
              disabled={recording}
              title={p.label}
            >
              <span className="cam-stage__preset-label">{p.label}</span>
              <span className="cam-stage__preset-note">{p.note}</span>
            </button>
          ))}
        </div>

        {recording ? (
          <>
            <div className="cam-stage__rec-badge"><span className="rec__dot" /> Gravando</div>
            <button className="cam-stage__btn cam-stage__btn--stop" onClick={stopRecording}>⏹ Parar e salvar</button>
          </>
        ) : (
          <button
            className="cam-stage__btn cam-stage__btn--rec"
            onClick={startRecording}
            disabled={!canRecord}
            title={!canRecord ? 'Ligue a câmera e aguarde o avatar carregar' : `Gravar ${preset.label} (${preset.note})`}
          >
            ⏺ Gravar
          </button>
        )}

        <div className="cam-stage__bar-right">
          {cameraOn && (
            <label className="cam-stage__speed">
              {libras.speed.toFixed(1)}×
              <input type="range" min="0.5" max="3" step="0.1" value={libras.speed}
                onChange={(e) => libras.setSpeed(Number(e.target.value))} />
            </label>
          )}
          <button
            className="cam-stage__btn cam-stage__btn--fs"
            onClick={toggleFullscreen}
            disabled={libras.status === 'loading'}
            title={libras.status === 'loading' ? 'Aguarde o avatar carregar' : isFullscreen ? 'Sair (Esc)' : 'Tela cheia'}
          >
            {isFullscreen ? '⛶ Sair' : '⛶ Tela cheia'}
          </button>
        </div>
      </div>

      {libras.interim && (
        <div className="cam-stage__interim-overlay">"{libras.interim}"</div>
      )}
    </div>
  );
}
