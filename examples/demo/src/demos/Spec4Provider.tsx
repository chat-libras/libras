import { useState } from 'react';
import { LibrasProvider, LibrasChatPanel } from 'libras-translator';

/**
 * Spec 4 — Configuração global (LibrasProvider).
 * Props locais sobrescrevem o provider. Sem provider, os defaults do plugin se aplicam.
 */
export function Spec4Provider() {
  const [speakerMsg, setSpeakerMsg] = useState('');
  const [listenerMsg, setListenerMsg] = useState('');
  const [customLabel, setCustomLabel] = useState('Enviar ✓');

  return (
    <div className="spec4">
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
            onChange={(e) => setCustomLabel(e.target.value)}
          />
        </label>
      </div>

      <LibrasProvider config={{ strings: { chatSendButton: customLabel } }}>
        <div className="call__grid">
          <section className="call__panel">
            <div className="call__badge">🏥 Atendente (speaker)</div>
            <p className="call__hint">Botão usa o label do Provider — sem prop local.</p>
            <LibrasChatPanel
              role="speaker"
              incomingMessage={listenerMsg}
              onMessage={setSpeakerMsg}
              labels={{ speaker: 'Atendente', listener: 'Paciente' }}
            />
          </section>

          <section className="call__panel">
            <div className="call__badge">🧏 Paciente (listener)</div>
            <p className="call__hint">
              Botão de resposta também herda o label do Provider.
            </p>
            <LibrasChatPanel
              role="listener"
              incomingMessage={speakerMsg}
              onMessage={setListenerMsg}
              labels={{ speaker: 'Atendente', listener: 'Paciente' }}
            />
          </section>
        </div>
      </LibrasProvider>
    </div>
  );
}
