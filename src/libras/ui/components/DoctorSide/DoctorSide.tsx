import { ChatLog } from '../ChatLog/ChatLog';
import { SendForm } from '../SendForm/SendForm';
import { useDoctorSpeech } from '../../hooks/useDoctorSpeech';
import type { DoctorSideProps } from '../../interfaces/DoctorSideProps';
import './DoctorSide.css';

// Lado MÉDICO (ouvinte): captura áudio (fala) OU escreve; lê as respostas em
// texto. Toda a lógica de captura (ASR plugável) vive em `useDoctorSpeech`;
// aqui fica só a montagem visual.
export function DoctorSide({ messages, onSend, labels, audio, asr }: DoctorSideProps) {
  const speech = useDoctorSpeech(audio, asr, onSend);

  return (
    <>
      <ChatLog messages={messages} mine="doctor" labels={labels} />
      {speech.interim && <div className="libras-chat__interim">🎤 {speech.interim}…</div>}
      {speech.error && <div className="libras-chat__error">{speech.error}</div>}
      <SendForm placeholder="Escrever para o cliente…" onSend={onSend}>
        <button
          type="button"
          onClick={speech.toggle}
          className={speech.listening ? 'libras-chat__mic libras-chat__mic--on' : 'libras-chat__mic'}
        >
          {speech.listening ? '⏹ Parar' : '🎤 Falar'}
        </button>
      </SendForm>
    </>
  );
}
