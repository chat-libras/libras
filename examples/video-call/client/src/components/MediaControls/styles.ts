import styled, { css } from 'styled-components';

export const Bar = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 14px 24px;
    background: ${theme.bg.secondary};
    border-top: 1px solid ${theme.border};
  `}
`;

export const Btn = styled.button<{ $variant?: 'on' | 'off' | 'leave' }>`
  ${({ theme, $variant }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    width: 52px;
    height: 52px;
    transition: background 0.15s, transform 0.1s;

    &:hover { transform: scale(1.08); }
    &:active { transform: scale(0.95); }

    .material-icons {
      font-size: 24px;
      user-select: none;
    }

    ${$variant === 'on' && css`
      background: ${theme.btn.active.bg};
      color: ${theme.btn.active.text};
      &:hover { background: ${theme.btn.active.hover}; }
    `}

    ${$variant === 'leave' && css`
      background: ${theme.btn.danger.bg};
      color: ${theme.btn.danger.text};
      width: 60px;
      height: 60px;
      .material-icons { font-size: 28px; }
      &:hover { background: ${theme.btn.danger.hover}; }
    `}

    ${(!$variant || $variant === 'off') && css`
      background: ${theme.btn.inactive.bg};
      color: ${theme.btn.inactive.text};
      &:hover { background: ${theme.btn.inactive.hover}; }
    `}
  `}
`;
