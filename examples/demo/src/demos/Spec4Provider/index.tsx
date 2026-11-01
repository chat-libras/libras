/**
 * Spec 4 — Configuração global com LibrasProvider
 *
 * Padrão demonstrado: LibrasProvider injeta config para todos os filhos via
 * context. Props locais sobrescrevem o provider — o provider é o default.
 *
 * Aqui customizamos strings.chatSendButton sem passar props aos componentes
 * filhos — o Provider é o único ponto de configuração.
 *
 * Fluxo:
 *   useProviderDemo()            → canal + customLabel
 *     → ProviderConfig           → input para editar o label ao vivo
 *     → LibrasProvider           → injeta config no contexto
 *       → ProviderParticipant x2 → herdam o label do Provider
 */
import { LibrasProvider } from 'libras-translator';
import { useProviderDemo } from './hooks/useProviderDemo';
import { ProviderConfig } from './components/ProviderConfig';
import { ProviderParticipant } from './components/ProviderParticipant';

const LABELS = { speaker: 'Atendente', listener: 'Paciente' } as const;

export function Spec4Provider() {
  const {
    speakerMsg, listenerMsg,
    onSpeakerMessage, onListenerMessage,
    customLabel, onCustomLabelChange,
  } = useProviderDemo();

  return (
    <div className="spec4">
      <ProviderConfig customLabel={customLabel} onLabelChange={onCustomLabelChange} />

      <LibrasProvider config={{ strings: { chatSendButton: customLabel } }}>
        <div className="call__grid">
          <ProviderParticipant
            role="speaker"
            badge="🏥 Atendente (speaker)"
            hint="Botão usa o label do Provider — sem prop local."
            incomingMessage={listenerMsg}
            onMessage={onSpeakerMessage}
            labels={LABELS}
          />

          <ProviderParticipant
            role="listener"
            badge="🧏 Paciente (listener)"
            hint="Botão de resposta também herda o label do Provider."
            incomingMessage={speakerMsg}
            onMessage={onListenerMessage}
            labels={LABELS}
          />
        </div>
      </LibrasProvider>
    </div>
  );
}
