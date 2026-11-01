import type { AvatarControlsProps } from '../interfaces/AvatarControlsProps';

export function AvatarControls({ libras, text, onTextChange, onSend }: AvatarControlsProps) {
  return (
    <div className="spec1__controls">
      <h3 className="spec__section-title">Controles</h3>

      <div className="spec__status-row">
        Status:&nbsp;
        <span className={`spec__badge spec__badge--${libras.status}`}>{libras.status}</span>
        {libras.error && <span className="spec__error">&nbsp;{libras.error}</span>}
      </div>

      {libras.interim && <p className="spec__interim">"{libras.interim}"</p>}

      <div className="spec__field">
        <input
          className="spec__input"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
          placeholder="Digite um texto para sinalizar…"
          disabled={libras.status === 'loading'}
        />
        <button
          className="spec__btn"
          onClick={onSend}
          disabled={libras.status === 'loading'}
        >
          Sinalizar
        </button>
      </div>

      <div className="spec__field">
        {libras.listening ? (
          <button className="spec__btn spec__btn--stop" onClick={libras.stop}>
            ⏹ Parar microfone
          </button>
        ) : (
          <button
            className="spec__btn"
            onClick={libras.start}
            disabled={libras.status === 'loading'}
          >
            🎤 Ligar microfone
          </button>
        )}
      </div>

      <label className="spec__label">
        Velocidade: {libras.speed.toFixed(1)}×
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.1"
          value={libras.speed}
          onChange={(e) => libras.setSpeed(Number(e.target.value))}
          className="spec__range"
        />
      </label>

      <p className="spec__code-hint">
        O avatar fica no div ao lado — posicionado com CSS puro, sem intervenção do plugin.
      </p>
    </div>
  );
}
