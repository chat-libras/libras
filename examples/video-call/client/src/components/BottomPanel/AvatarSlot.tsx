import type { LibrasTranslatorApi } from 'libras-translator';
import { AvatarContainer, AvatarHint, LibrasStage } from './styles.ts';

interface AvatarSlotProps {
  libras: LibrasTranslatorApi;
  librasOn: boolean;
}

// Componente isolado — quando remontado via key, o containerRef é chamado com null
// depois com o novo elemento, forçando o useLibrasTranslator a reinicializar o player
export function AvatarSlot({ libras, librasOn }: AvatarSlotProps) {
  return (
    <AvatarContainer style={{ display: librasOn ? undefined : 'none' }}>
      <LibrasStage ref={libras.containerRef} />
      {libras.status === 'loading'   && <AvatarHint>⏳ Carregando avatar VLibras…</AvatarHint>}
      {libras.status === 'error'     && <AvatarHint style={{ color: '#f87171' }}>⚠️ Erro: {libras.error}</AvatarHint>}
      {libras.status === 'ready'     && <AvatarHint>🎤 Pronto — aguardando fala…</AvatarHint>}
      {libras.status === 'listening' && <AvatarHint>🤟 Ouvindo — sinalizando em Libras</AvatarHint>}
    </AvatarContainer>
  );
}
