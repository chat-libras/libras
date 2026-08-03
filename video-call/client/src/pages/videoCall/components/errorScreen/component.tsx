import * as S from '../loadingScreen/styles.ts';
import type { ErrorScreenProps } from './component.types.ts';

export function ErrorScreen({ message, onBack }: ErrorScreenProps) {
  return (
    <S.Gate $error>
      <S.ErrorIcon className="material-icons">error_outline</S.ErrorIcon>
      <S.Label>{message}</S.Label>
      <S.BackBtn onClick={onBack}>← Voltar ao início</S.BackBtn>
    </S.Gate>
  );
}
