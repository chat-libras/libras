import styled, { css } from 'styled-components';

export const Wrap = styled.div`
  ${() => css`
    display: flex;
    flex-direction: row;
    height: 100%;
    flex-shrink: 0;
    align-items: stretch;
  `}
`;

export const ContentPanel = styled.div<{ $visible: boolean }>`
  ${({ $visible }) => css`
    width: ${$visible ? '320px' : '0'};
    overflow: hidden;
    transition: width 0.2s ease;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;

    & > * {
      width: 320px;
      height: 100%;
    }
  `}
`;

export const BtnRail = styled.div<{ $isOpen?: boolean }>`
  ${({ theme, $isOpen }) => css`
    display: flex;
    flex-direction: column;
    width: 48px;
    flex-shrink: 0;
    background: ${theme.bg.secondary};
    border: 1px solid ${theme.border};
    overflow: hidden;

    ${$isOpen
      ? css`
          border-top-right-radius: 8px;
          border-bottom-right-radius: 8px;
        `
      : css`
          border-radius: 8px;
        `}
  `}
`;

export const RailBtn = styled.button<{ $active?: boolean; $last?: boolean }>`
  ${({ theme, $active, $last }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border: none;
    border-bottom: ${$last ? 'none' : `1px solid ${theme.border}`};
    border-radius: 0;
    background: ${$active ? theme.btn.active.bg : 'transparent'};
    color: ${$active ? theme.btn.active.text : theme.text.secondary};
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    flex-shrink: 0;

    &:hover {
      background: ${$active ? theme.btn.active.hover : theme.bg.tertiary};
      color: ${theme.text.primary};
    }

    .material-icons {
      font-size: 22px;
      user-select: none;
    }
  `}
`;
