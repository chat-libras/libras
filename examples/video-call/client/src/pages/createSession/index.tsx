import { useCreateSession } from './store/createSession.store.ts';
import { PageButton, PageErrorText, Spinner } from '../../styles/shared.styles.ts';
import * as S from './styles.ts';
import type { RoomModel } from '../../modules/room/room.model.ts';

interface CreateSessionPageProps {
  onCreated: (room: RoomModel) => void;
}

export function CreateSessionPage({ onCreated }: CreateSessionPageProps) {
  const { createSession, loading, error } = useCreateSession();

  const handleCreate = async () => {
    const room = await createSession();
    if (room) onCreated(room);
  };

  return (
    <S.Wrapper>
      <S.Card>
        <S.Title>🤝 Libras Video Call</S.Title>
        <S.Subtitle>Harness de teste da lib libras-translator</S.Subtitle>

        <S.Section>
          <S.Desc>
            Crie uma nova sessão de videochamada e em seguida gere os links de acesso
            para cada participante.
          </S.Desc>
          {error && <PageErrorText>{error}</PageErrorText>}
          <PageButton onClick={handleCreate} disabled={loading}>
            {loading ? <><Spinner />Criando…</> : '+ Nova sessão'}
          </PageButton>
        </S.Section>
      </S.Card>
    </S.Wrapper>
  );
}
