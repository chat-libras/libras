import { Bar, Btn } from './styles.ts';

interface MediaControlsProps {
  cameraOn: boolean;
  micOn: boolean;
  audioOn: boolean;
  librasOn: boolean;
  showLibrasToggle: boolean;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  onToggleAudio: () => void;
  onToggleLibras: () => void;
  onLeave: () => void;
}

export function MediaControls({
  cameraOn, micOn, audioOn, librasOn, showLibrasToggle,
  onToggleCamera, onToggleMic, onToggleAudio, onToggleLibras, onLeave,
}: MediaControlsProps) {
  return (
    <Bar>
      <Btn $variant={micOn ? 'on' : 'off'} onClick={onToggleMic} title={micOn ? 'Desativar microfone' : 'Ativar microfone'}>
        <span className="material-icons">{micOn ? 'mic' : 'mic_off'}</span>
      </Btn>
      <Btn $variant={cameraOn ? 'on' : 'off'} onClick={onToggleCamera} title={cameraOn ? 'Desativar câmera' : 'Ativar câmera'}>
        <span className="material-icons">{cameraOn ? 'videocam' : 'videocam_off'}</span>
      </Btn>
      <Btn $variant={audioOn ? 'on' : 'off'} onClick={onToggleAudio} title={audioOn ? 'Mutar áudio remoto' : 'Ouvir áudio remoto'}>
        <span className="material-icons">{audioOn ? 'volume_up' : 'volume_off'}</span>
      </Btn>
      {showLibrasToggle && (
        <Btn $variant={librasOn ? 'on' : 'off'} onClick={onToggleLibras} title={librasOn ? 'Desativar Libras' : 'Ativar Libras'}>
          <span className="material-icons">{librasOn ? 'sign_language' : 'do_not_touch'}</span>
        </Btn>
      )}
      <Btn $variant="leave" onClick={onLeave} title="Sair da chamada">
        <span className="material-icons">call_end</span>
      </Btn>
    </Bar>
  );
}
