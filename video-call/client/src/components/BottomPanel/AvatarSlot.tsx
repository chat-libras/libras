import type { LibrasAvatarApi } from 'libras-translator';
import { AvatarContainer, AvatarHint, LibrasStage } from './styles.ts';

interface AvatarSlotProps {
  avatar: LibrasAvatarApi;
  librasOn: boolean;
}

// Componente isolado — quando remontado via key, o containerRef é chamado com null
// depois com o novo elemento, forçando o useLibrasAvatar a reinicializar o player
export function AvatarSlot({ avatar, librasOn }: AvatarSlotProps) {
  return (
    <AvatarContainer style={{ display: librasOn ? undefined : 'none' }}>
      <LibrasStage ref={avatar.containerRef} />
      {avatar.status === 'loading' && <AvatarHint>⏳ Carregando avatar VLibras…</AvatarHint>}
      {avatar.status === 'error'   && <AvatarHint style={{ color: '#f87171' }}>⚠️ Erro: {avatar.error}</AvatarHint>}
      {avatar.status === 'ready'   && <AvatarHint>🤟 Pronto — sinalizando mensagens</AvatarHint>}
    </AvatarContainer>
  );
}
