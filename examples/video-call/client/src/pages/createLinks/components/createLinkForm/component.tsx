import { useState } from 'react';
import { useCreateLink } from '../../store/createLink.store.ts';
import { ROLE_LABELS } from '../../types/roles.types.ts';
import { PageInput, PageButton, PageErrorText } from '../../../../styles/shared.styles.ts';
import * as S from './styles.ts';
import type { CreateLinkFormProps } from './component.types.ts';

export function CreateLinkForm({ roomId, role, onCreated }: CreateLinkFormProps) {
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const { createLink, loading, error } = useCreateLink();

  const handleSubmit = async () => {
    if (!name.trim()) return;
    const link = await createLink({ roomId, name: name.trim(), role, document: document.trim() || null });
    if (link) {
      onCreated(link);
      setName('');
      setDocument('');
    }
  };

  return (
    <S.Wrap>
      <S.FormTitle>{ROLE_LABELS[role]}</S.FormTitle>
      <PageInput
        placeholder="Nome do participante"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
      />
      <PageInput
        placeholder="Documento (opcional)"
        value={document}
        onChange={(e) => setDocument(e.target.value)}
      />
      {error && <PageErrorText>{error}</PageErrorText>}
      <PageButton $sm onClick={handleSubmit} disabled={!name.trim() || loading}>
        {loading ? 'Gerando…' : 'Gerar link'}
      </PageButton>
    </S.Wrap>
  );
}
