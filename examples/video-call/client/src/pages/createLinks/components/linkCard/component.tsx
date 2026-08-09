import { useState } from 'react';
import { ROLE_LABELS } from '../../types/roles.types.ts';
import * as S from './styles.ts';
import type { LinkCardProps } from './component.types.ts';

export function LinkCard({ link, onOpen }: LinkCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link.accessUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <S.Card>
      <S.Info>
        <S.Role>{ROLE_LABELS[link.role]}</S.Role>
        <S.Name>{link.name}</S.Name>
      </S.Info>
      <S.Actions>
        <S.ActionBtn onClick={handleCopy} title="Copiar link">
          <span className="material-icons">{copied ? 'check' : 'content_copy'}</span>
        </S.ActionBtn>
        <S.ActionBtn $primary onClick={onOpen} title="Abrir chamada">
          <span className="material-icons">videocam</span>
        </S.ActionBtn>
      </S.Actions>
    </S.Card>
  );
}
