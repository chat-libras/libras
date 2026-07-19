import './DemoNote.css';

// Nota de rodapé explicando o que a demo simula e como usar em produção.
export function DemoNote() {
  return (
    <p className="tm__note">
      Demo: o microfone simula a fala do médico. Em produção, passe a faixa de áudio remota do WebRTC
      (<code>audio={'{'} kind: 'stream', stream {'}'}</code>) com um ASR de nuvem (Deepgram).
    </p>
  );
}
