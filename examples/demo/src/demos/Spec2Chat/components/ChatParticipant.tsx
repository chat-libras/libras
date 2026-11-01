import { LibrasChat } from 'libras-translator';
import { VideoBox } from '../../../components/VideoBox';
import type { ChatParticipantProps } from '../interfaces/ChatParticipantProps';

export function ChatParticipant({
  role,
  badge,
  videoVariant,
  videoLabel,
  videoEmoji,
  hint,
  messages,
  onSend,
  labels,
}: ChatParticipantProps) {
  return (
    <section className="call__panel">
      <div className="call__badge">{badge}</div>
      <VideoBox variant={videoVariant} label={videoLabel} emoji={videoEmoji} />
      <p className="call__hint">{hint}</p>
      <LibrasChat role={role} messages={messages} onSend={onSend} labels={labels} />
    </section>
  );
}
