import { useState } from 'react';
import {
  useLibrasTranslator,
  type UseLibrasTranslatorOptions,
  type LibrasTranslatorApi,
} from './useLibrasTranslator';
import { resolveStrings, type LibrasStrings } from './strings';
import { useLibrasConfig } from './LibrasProvider';

// ---------------------------------------------------------------------------
// Componente pronto-para-usar: renderiza o avatar do VLibras traduzindo o áudio
// dado. Ideal para embutir num app de chamada de vídeo (telemedicina).
//
//   <LibrasTranslator
//     audio={{ kind: 'stream', stream: remoteAudioStream }}
//     asr={{ provider: 'custom', factory: myASRFactory }}
//     showCaptions
//     controls
//   />
// ---------------------------------------------------------------------------

/** Quais controles embutidos exibir. `true` = todos. */
export type LibrasControls =
  | boolean
  | {
      /** Botão iniciar/parar a tradução do áudio. */
      start?: boolean;
      /** Campo para digitar e sinalizar um texto (sem áudio). */
      text?: boolean;
      /** Botão para ciclar a velocidade da sinalização. */
      speed?: boolean;
    };

export interface LibrasTranslatorProps extends UseLibrasTranslatorOptions {
  className?: string;
  style?: React.CSSProperties;
  /** Mostra a transcrição parcial sobre o avatar. */
  showCaptions?: boolean;
  /**
   * Controles embutidos (start/parar, velocidade, input de texto).
   * Ligado por padrão; `false` esconde, ou um objeto escolhe quais.
   */
  controls?: LibrasControls;
  /**
   * Textos da UI (botões, placeholders, estados). Sobrescreva para i18n ou
   * rebranding sem modificar o componente.
   */
  strings?: LibrasStrings;
}

// Ciclo de velocidade: 1× → 2× em passos de 0.25×, volta ao início.
const SPEED_STEP = 0.25;
const SPEED_MIN = 1;
const SPEED_MAX = 2;

function resolveControls(controls: LibrasControls | undefined) {
  if (controls === undefined || controls === true) {
    return { start: true, text: true, speed: true };
  }
  if (controls === false) return { start: false, text: false, speed: false };
  return { start: !!controls.start, text: !!controls.text, speed: !!controls.speed };
}

function Controls({
  api,
  show,
  s,
}: {
  api: LibrasTranslatorApi;
  show: { start: boolean; text: boolean; speed: boolean };
  s: Required<LibrasStrings>;
}) {
  const [phrase, setPhrase] = useState('');
  const disabled = api.status === 'loading' || api.status === 'error';

  const nextSpeed = () => {
    const value = api.speed >= SPEED_MAX ? SPEED_MIN : Math.round((api.speed + SPEED_STEP) * 100) / 100;
    api.setSpeed(value);
  };

  const submitText = (e: React.FormEvent) => {
    e.preventDefault();
    const text = phrase.trim();
    if (!text) return;
    api.translate(text);
    setPhrase('');
  };

  return (
    <div className="libras-translator__controls">
      {show.text && (
        <form className="libras-translator__text" onSubmit={submitText}>
          <input
            className="libras-translator__input"
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder={s.captionPlaceholder}
            aria-label={s.captionPlaceholder}
            disabled={api.status === 'loading'}
          />
          <button type="submit" disabled={api.status === 'loading'}>
            {s.buttonSubmitText}
          </button>
        </form>
      )}

      <div className="libras-translator__buttons">
        {show.start && (
          <button
            className="libras-translator__btn"
            onClick={api.listening ? api.stop : api.start}
            disabled={disabled}
            aria-pressed={api.listening}
          >
            {api.listening ? s.buttonStop : s.buttonTranslate}
          </button>
        )}
        {show.speed && (
          <button
            className="libras-translator__btn"
            onClick={nextSpeed}
            disabled={disabled}
            title={s.buttonSpeedLabel}
            aria-label={`${s.buttonSpeedLabel} — ${api.speed.toFixed(2)}×`}
          >
            ⏩ {api.speed.toFixed(2)}×
          </button>
        )}
      </div>
    </div>
  );
}

export function LibrasTranslator({
  className,
  style,
  showCaptions,
  controls,
  strings: stringsProp,
  ...options
}: LibrasTranslatorProps) {
  const ctx = useLibrasConfig();
  const s = resolveStrings({ ...ctx.strings, ...stringsProp });
  const libras = useLibrasTranslator(options);
  const show = resolveControls(controls);
  const hasControls = show.start || show.text || show.speed;

  return (
    <div className={`libras-translator ${className ?? ''}`} style={style}>
      <div
        ref={libras.containerRef}
        className="libras-translator__stage"
        role="img"
        aria-label={s.avatarAriaLabel}
      />

      {libras.status === 'loading' && (
        <div className="libras-translator__overlay" aria-live="polite">
          {s.avatarLoading}
        </div>
      )}
      {libras.status === 'error' && (
        <div className="libras-translator__overlay libras-translator__overlay--error" role="alert">
          {libras.error}
        </div>
      )}
      {showCaptions && libras.interim && (
        <div className="libras-translator__caption" aria-live="polite">
          {libras.interim}
        </div>
      )}

      {hasControls && <Controls api={libras} show={show} s={s} />}
    </div>
  );
}
