import styled, { css } from 'styled-components';

export const Wrap = styled.div<{ $visible: boolean; $split: boolean }>`
  ${({ $visible, $split }) => css`
    display: ${$visible ? 'flex' : 'none'};
    gap: 12px;
    height: 340px;
    flex-shrink: 0;
    overflow: hidden;

    ${$split && css`& > * { flex: 1; min-width: 0; }`}
    ${!$split && css`& > * { flex: 1; }`}
  `}
`;

export const AvatarContainer = styled.div`
  ${({ theme }) => css`
    background: ${theme.bg.tile};
    border: 1px solid ${theme.border};
    border-radius: 8px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    overflow: hidden;
  `}
`;

export const LibrasStage = styled.div`
  width: 100%;
  flex: 1;
  min-height: 0;
`;

export const AvatarHint = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.text.muted};
  margin-top: 8px;
`;
