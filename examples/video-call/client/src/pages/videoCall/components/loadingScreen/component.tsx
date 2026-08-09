import * as S from './styles.ts';

export function LoadingScreen() {
  return (
    <S.Gate>
      <S.SpinnerRing />
      <S.Label>Verificando sessão…</S.Label>
    </S.Gate>
  );
}
