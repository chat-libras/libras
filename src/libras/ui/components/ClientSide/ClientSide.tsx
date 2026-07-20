import { ChatLog } from '../ChatLog/ChatLog';
import { SendForm } from '../SendForm/SendForm';
import { useLibrasAvatar } from '../../useLibrasAvatar';
import { useClientSignaling } from '../../hooks/useClientSignaling';
import { nextSpeedValue } from '../../utils/speed';
import type { ClientSideProps } from '../../interfaces/ClientSideProps';
import './ClientSide.css';

// Lado CLIENTE (surdo): o avatar do VLibras sinaliza as falas do médico e o
// cliente responde por texto. O avatar só sinaliza texto pronto — não capta
// áudio. O chat de texto sempre funciona, mesmo com o avatar carregando/falho.
export function ClientSide({ messages, onSend, labels, vlibras, speed }: ClientSideProps) {
  const avatar = useLibrasAvatar({ speed, vlibras });
  useClientSignaling(messages, avatar.translate);

  return (
    <>
      <div className="libras-chat__avatar">
        <div ref={avatar.containerRef} className="libras-chat__stage" />
        <button
          type="button"
          className="libras-chat__speed"
          onClick={() => avatar.setSpeed(nextSpeedValue(avatar.speed))}
          disabled={avatar.status !== 'ready'}
          title="Ajustar a velocidade do avatar"
        >
          ⏩ {avatar.speed.toFixed(2)}×
        </button>
      </div>
      {avatar.status === 'loading' && <div className="libras-chat__interim">Carregando avatar…</div>}
      {avatar.status === 'error' && <div className="libras-chat__error">{avatar.error}</div>}

      <ChatLog messages={messages} mine="client" labels={labels} />

      <SendForm placeholder="Responder ao médico…" onSend={onSend} />
    </>
  );
}
