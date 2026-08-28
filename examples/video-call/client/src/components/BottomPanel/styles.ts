import styled, { css } from 'styled-components';

export const Wrap = styled.div<{ $visible: boolean; $split: boolean }>`
  ${({ $visible, $split }) => css`
    display: ${$visible ? 'flex' : 'none'};
    gap: 12px;
    height: 260px;
    flex-shrink: 0;
    overflow: hidden;
    padding: 8px;
    align-items: stretch;

    & > * { flex: 1; min-width: 0; }
    ${$split && css`& > * { flex: 1; min-width: 0; max-width: 50%; }`}
  `}
`;

export const AvatarContainer = styled.div`
  ${({ theme }) => css`
    background: ${theme.bg.tile};
    border: 1px solid ${theme.border};
    border-radius: 8px;
    padding: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  `}
`;

export const LibrasStage = styled.div`
  width: 100%;
  height: 100%;
  min-height: 0;

  & > div,
  & iframe,
  & canvas {
    width: 100% !important;
    height: 100% !important;
    max-height: 240px;
    object-fit: contain;
  }
`;

export const AvatarHint = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.text.muted};
  margin-top: 4px;
`;

export const SpeedControls = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 4px;
`;

export const SpeedBtn = styled.button<{ $active?: boolean }>`
  ${({ theme, $active }) => css`
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 600;
    border-radius: 4px;
    border: 1px solid ${$active ? theme.btn.active.bg : theme.border};
    background: ${$active ? theme.btn.active.bg : 'transparent'};
    color: ${$active ? '#fff' : theme.text.muted};
    cursor: pointer;
    transition: all 0.15s;

    &:hover {
      border-color: ${theme.btn.active.bg};
      color: #fff;
    }
  `}
`;
