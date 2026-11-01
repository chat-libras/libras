import { LibrasChatPanel } from 'libras-translator';
import type { ProviderParticipantProps } from '../interfaces/ProviderParticipantProps';

export function ProviderParticipant({
  role,
  badge,
  hint,
  incomingMessage,
  onMessage,
  labels,
}: ProviderParticipantProps) {
  return (
    <section className="call__panel">
      <div className="call__badge">{badge}</div>
      <p className="call__hint">{hint}</p>
      <LibrasChatPanel
        role={role}
        incomingMessage={incomingMessage}
        onMessage={onMessage}
        labels={labels}
      />
    </section>
  );
}
