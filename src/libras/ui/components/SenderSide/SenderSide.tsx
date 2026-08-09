import { ChatLog } from '../ChatLog/ChatLog';
import { SendForm } from '../SendForm/SendForm';
import { useSenderSpeech } from '../../hooks/useSenderSpeech';
import type { SenderSideProps } from '../../interfaces/SenderSideProps';
import './SenderSide.css';

// Lado SENDER (quem fala/digita): captura áudio OU escreve; lê respostas em
// texto. Toda a lógica de captura (ASR plugável) vive em `useSenderSpeech`;
// aqui fica só a montagem visual.
export function SenderSide({ messages, onSend, labels, audio, asr, strings }: SenderSideProps) {
  const speech = useSenderSpeech(audio, asr, onSend);

  return (
    <>
      <ChatLog messages={messages} mine="sender" labels={labels} />
      {speech.interim && (
        <div className="libras-chat__interim" aria-live="polite">
          🎤 {speech.interim}…
        </div>
      )}
      {speech.error && (
        <div className="libras-chat__error" role="alert">
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
          className={speech.listening ? 'libras-chat__mic libras-chat__mic--on' : 'libras-chat__mic'}
          aria-pressed={speech.listening}
          aria-label={speech.listening ? strings.chatMicStop : strings.chatMicStart}
        >
          {speech.listening ? strings.chatMicStop : strings.chatMicStart}
        </button>
      </SendForm>
    </>
  );
}
