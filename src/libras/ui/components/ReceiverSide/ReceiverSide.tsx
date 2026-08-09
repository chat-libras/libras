import { ChatLog } from '../ChatLog/ChatLog';
import { SendForm } from '../SendForm/SendForm';
import { useLibrasAvatar } from '../../useLibrasAvatar';
import { useReceiverSignaling } from '../../hooks/useReceiverSignaling';
import { nextSpeedValue } from '../../utils/speed';
import type { ReceiverSideProps } from '../../interfaces/ReceiverSideProps';
import './ReceiverSide.css';

// Lado RECEIVER (quem vê em Libras): o avatar do VLibras sinaliza as falas do
// sender; o receiver responde por texto. O avatar só sinaliza texto pronto —
// não capta áudio. O chat de texto funciona mesmo com o avatar carregando/falho.
export function ReceiverSide({ messages, onSend, labels, vlibras, speed, strings }: ReceiverSideProps) {
  const avatar = useLibrasAvatar({ speed, vlibras });
  useReceiverSignaling(messages, avatar.translate);

  return (
    <>
      <div className="libras-chat__avatar">
        <div
          ref={avatar.containerRef}
          className="libras-chat__stage"
          role="img"
          aria-label={strings.avatarAriaLabel}
        />
        <button
          type="button"
          className="libras-chat__speed"
          onClick={() => avatar.setSpeed(nextSpeedValue(avatar.speed))}
          disabled={avatar.status !== 'ready'}
          title={strings.buttonSpeedLabel}
          aria-label={strings.buttonSpeedLabel}
        >
          ⏩ {avatar.speed.toFixed(2)}×
        </button>
      </div>
      {avatar.status === 'loading' && (
        <div className="libras-chat__interim" aria-live="polite">
          {strings.avatarLoading}
        </div>
      )}
      {avatar.status === 'error' && (
        <div className="libras-chat__error" role="alert">
          {avatar.error}
        </div>
      )}

      <ChatLog messages={messages} mine="receiver" labels={labels} />

      <SendForm
        placeholder={strings.chatReceiverPlaceholder}
        submitLabel={strings.chatSendButton}
        onSend={onSend}
      />
    </>
  );
}
