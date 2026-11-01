import { ChatLog } from '../ChatLog';
import { SendForm } from '../SendForm';
import { useSenderSpeech } from '../../hooks/useSenderSpeech';
import type { SenderSideProps } from '../../interfaces/SenderSideProps';

export function SenderSide({ messages, onSend, labels, audio, asr, strings }: SenderSideProps) {
  const speech = useSenderSpeech(audio, asr, onSend);

  return (
    <>
      <ChatLog messages={messages} mine="sender" labels={labels} />
      {speech.interim && (
        <div className="libras-chat__status" data-status="interim" aria-live="polite">
          🎤 {speech.interim}…
        </div>
      )}
      {speech.error && (
        <div className="libras-chat__status" data-status="error" role="alert">
          {speech.error}
        </div>
      )}
      <SendForm
        placeholder={strings.chatSenderPlaceholder}
        submitLabel={strings.chatSendButton}
        onSend={onSend}
      >
        <button
          type="button"
          onClick={speech.toggle}
          className="libras-chat__mic"
          aria-pressed={speech.listening}
          data-active={speech.listening}
          aria-label={speech.listening ? strings.chatMicStop : strings.chatMicStart}
        >
          {speech.listening ? strings.chatMicStop : strings.chatMicStart}
        </button>
      </SendForm>
    </>
  );
}
