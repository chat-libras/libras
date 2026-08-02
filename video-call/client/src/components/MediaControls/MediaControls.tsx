import styled, { css } from 'styled-components';

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

const Bar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 14px 24px;
  background: ${({ theme }) => theme.bg.secondary};
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const Btn = styled.button<{ $variant?: 'on' | 'off' | 'leave' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  width: 52px;
  height: 52px;
  transition: background 0.15s, transform 0.1s;
  &:hover { transform: scale(1.08); }
  &:active { transform: scale(0.95); }
  .material-icons { font-size: 24px; user-select: none; }
  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'on':
        return css`background:${theme.btn.active.bg};color:${theme.btn.active.text};&:hover{background:${theme.btn.active.hover};}`;
      case 'leave':
        return css`background:${theme.btn.danger.bg};color:${theme.btn.danger.text};width:60px;height:60px;.material-icons{font-size:28px;}&:hover{background:${theme.btn.danger.hover};}`;
      default:
        return css`background:${theme.btn.inactive.bg};color:${theme.btn.inactive.text};&:hover{background:${theme.btn.inactive.hover};}`;
    }
  }}
`;

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
