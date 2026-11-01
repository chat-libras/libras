import { LibrasChatPanel } from 'libras-translator';
import type { PanelParticipantProps } from '../interfaces/PanelParticipantProps';

export function PanelParticipant({
  role,
  badge,
  hint,
  incomingMessage,
  onMessage,
  labels,
}: PanelParticipantProps) {
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
