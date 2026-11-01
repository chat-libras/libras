import { useState } from 'react';
import { useLibrasTranslator, type LibrasTranslatorApi } from './hooks/useLibrasTranslator';
import { resolveStrings, type LibrasStrings } from './utils/strings';
import { useLibrasConfig } from './LibrasProvider';
import { resolveControls } from './utils/resolveControls';
import { SPEED_STEP, SPEED_MIN, SPEED_MAX } from './utils/speed';
import type { LibrasTranslatorProps } from './interfaces/LibrasTranslatorProps';

export type { LibrasControls, LibrasTranslatorProps } from './interfaces/LibrasTranslatorProps';

function Controls({
  api,
  show,
  strings,
}: {
  api: LibrasTranslatorApi;
  show: { start: boolean; text: boolean; speed: boolean };
  strings: Required<LibrasStrings>;
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
            placeholder={strings.captionPlaceholder}
            aria-label={strings.captionPlaceholder}
            disabled={disabled}
          />
          <button type="submit" disabled={disabled}>
            {strings.buttonSubmitText}
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
            {api.listening ? strings.buttonStop : strings.buttonTranslate}
          </button>
        )}
        {show.speed && (
          <button
            className="libras-translator__btn"
            onClick={nextSpeed}
            disabled={disabled}
            title={strings.buttonSpeedLabel}
            aria-label={`${strings.buttonSpeedLabel} — ${api.speed.toFixed(2)}×`}
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
  const strings = resolveStrings({ ...ctx.strings, ...stringsProp });
  const libras = useLibrasTranslator(options);
  const show = resolveControls(controls);
  const hasControls = show.start || show.text || show.speed;

  return (
    <div className={`libras-translator ${className ?? ''}`} style={style}>
      <div
        ref={libras.containerRef}
        className="libras-translator__stage"
        role="img"
        aria-label={strings.avatarAriaLabel}
      />

      {libras.status === 'loading' && (
        <div className="libras-translator__overlay" data-status="loading" aria-live="polite">
          {strings.avatarLoading}
        </div>
      )}
      {libras.status === 'error' && (
        <div className="libras-translator__overlay" data-status="error" role="alert">
          {libras.error}
        </div>
      )}
      {showCaptions && libras.interim && (
        <div className="libras-translator__caption" aria-live="polite">
          {libras.interim}
        </div>
      )}

      {hasControls && <Controls api={libras} show={show} strings={strings} />}
    </div>
  );
}
