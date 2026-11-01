/**
 * Spec 5 — Gravação com câmera + avatar
 *
 * Demonstra como compor useLibrasTranslator com MediaRecorder para gravar
 * um vídeo com o avatar Libras em picture-in-picture sobre a câmera.
 *
 * Padrão aplicado: responsabilidades divididas em 3 hooks:
 *   - useCameraStream    → abre webcam e retorna videoRef + streamRef
 *   - useLibrasTranslator → monta o avatar e faz ASR
 *   - useRecorder        → composita canvas + MediaRecorder
 *
 * Pré-requisito: rodar em Chrome (MediaRecorder + captureStream)
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLibrasTranslator } from 'libras-translator';
import { PRESETS, ASPECT, type PresetId } from './presets';
import { useCameraStream } from './hooks/useCameraStream';
import { useRecorder } from './hooks/useRecorder';

export function Spec5Recorder() {
  const containerElRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [presetId, setPresetId] = useState<PresetId>('youtube');
  const preset = PRESETS.find((p) => p.id === presetId)!;

  const { videoRef, streamRef, cameraOn, enableCamera } = useCameraStream();

  const libras = useLibrasTranslator({
    audio: { kind: 'microphone' },
    autoStart: false,
    speed: 3,
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

  const { recording, startRecording, stopRecording } = useRecorder({
    preset,
    presetId,
    webcamVideoRef: videoRef,
    webcamStreamRef: streamRef,
    avatarContainerRef: containerElRef,
  });

  // Esc fecha o fullscreen CSS sem depender da Fullscreen API do browser
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsFullscreen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const canRecord = cameraOn && (libras.status === 'ready' || libras.status === 'listening');

  return (
    <div
      className={`cam-stage ${isFullscreen ? 'cam-stage--fullscreen' : ''}`}
      style={isFullscreen ? undefined : { aspectRatio: ASPECT[presetId] }}
    >
      <video
        ref={videoRef}
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
            onClick={() => setIsFullscreen((f) => !f)}
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
