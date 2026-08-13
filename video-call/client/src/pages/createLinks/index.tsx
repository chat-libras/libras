import { useState } from 'react';
import { CreateLinkForm } from './components/createLinkForm/index.ts';
import { LinkCard } from './components/linkCard/index.ts';
import * as S from './styles.ts';
import type { RoomModel } from '../../modules/room/room.model.ts';
import type { CallLinkModel } from '../../modules/call-link/call-link.model.ts';

interface CreateLinksPageProps {
  room: RoomModel;
}

export function CreateLinksPage({ room }: CreateLinksPageProps) {
  const [links, setLinks] = useState<CallLinkModel[]>([]);

  const patientLinks      = links.filter((l) => l.role === 'PATIENT');
  const professionalLinks = links.filter((l) => l.role === 'HEALTH_PROFESSIONAL');

  return (
    <S.Wrapper>
      <S.Card>
        <S.HeaderRow>
          <div>
            <S.Title>Sessão criada ✓</S.Title>
            <S.SessionId>ID: {room.id}</S.SessionId>
          </div>
        </S.HeaderRow>

        <S.Panels>
          <S.Panel>
            <CreateLinkForm roomId={room.id} role="PATIENT" onCreated={(l) => setLinks((p) => [...p, l])} />
            <S.LinkList>
              {patientLinks.map((l) => <LinkCard key={l.id} link={l} />)}
            </S.LinkList>
          </S.Panel>

          <S.Divider />

          <S.Panel>
            <CreateLinkForm roomId={room.id} role="HEALTH_PROFESSIONAL" onCreated={(l) => setLinks((p) => [...p, l])} />
            <S.LinkList>
              {professionalLinks.map((l) => <LinkCard key={l.id} link={l} />)}
            </S.LinkList>
          </S.Panel>
        </S.Panels>
      </S.Card>
    </S.Wrapper>
  );
}
