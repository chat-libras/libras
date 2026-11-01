import type { ProviderConfigProps } from '../interfaces/ProviderConfigProps';

export function ProviderConfig({ customLabel, onLabelChange }: ProviderConfigProps) {
  return (
    <div className="spec4__config">
      <p className="spec4__desc">
        <code>&lt;LibrasProvider&gt;</code> define defaults globais. Aqui sobrescrevemos o
        rótulo do botão de envio — sem prop local nos componentes filhos.
      </p>
      <label className="spec__label">
        <code>chatSendButton</code>:&nbsp;
        <input
          className="spec__input spec__input--sm"
          value={customLabel}
          onChange={(e) => onLabelChange(e.target.value)}
        />
      </label>
    </div>
  );
}
