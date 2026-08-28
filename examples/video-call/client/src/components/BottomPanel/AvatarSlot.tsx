import type { LibrasTranslatorApi } from 'libras-translator';
import { AvatarContainer, AvatarHint, LibrasStage, SpeedControls, SpeedBtn } from './styles.ts';

interface AvatarSlotProps {
  libras: LibrasTranslatorApi;
  librasOn: boolean;
}

const SPEEDS = [1, 1.5, 2, 2.5, 3];

export function AvatarSlot({ libras, librasOn }: AvatarSlotProps) {
  return (
    <AvatarContainer style={{ display: librasOn ? undefined : 'none' }}>
      <LibrasStage ref={libras.containerRef} />
      <SpeedControls>
        {SPEEDS.map((s) => (
          <SpeedBtn
            key={s}
            $active={libras.speed === s}
            onClick={() => libras.setSpeed(s)}
            title={`Velocidade ${s}x`}
          >
            {s}x
          </SpeedBtn>
        ))}
      </SpeedControls>
      {libras.status === 'loading'   && <AvatarHint>⏳ Carregando avatar VLibras…</AvatarHint>}
      {libras.status === 'error'     && <AvatarHint style={{ color: '#f87171' }}>⚠️ Erro: {libras.error}</AvatarHint>}
      {libras.status === 'ready'     && <AvatarHint>🎤 Pronto — aguardando fala…</AvatarHint>}
      {libras.status === 'listening' && <AvatarHint>🤟 Ouvindo — sinalizando em Libras</AvatarHint>}
    </AvatarContainer>
  );
}
