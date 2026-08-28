import styled from 'styled-components';

// ── Formulário / inputs compartilhados entre páginas de lobby ────────────────

export const PageInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  background: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  color: ${({ theme }) => theme.text.primary};
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;

  &::placeholder { color: ${({ theme }) => theme.text.muted}; }
  &:focus { border-color: ${({ theme }) => theme.btn.active.bg}; }
`;

export const PageButton = styled.button<{ $sm?: boolean }>`
  width: 100%;
  padding: ${({ $sm }) => ($sm ? '8px 14px' : '12px')};
  background: ${({ theme }) => theme.btn.active.bg};
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: ${({ $sm }) => ($sm ? '13px' : '15px')};
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;

  &:hover:not(:disabled) { background: ${({ theme }) => theme.btn.active.hover}; }
  &:disabled { background: ${({ theme }) => theme.border}; cursor: not-allowed; }
`;

export const PageErrorText = styled.p`
  font-size: 12px;
  color: #f87171;
  background: #1f1022;
  padding: 8px 10px;
  border-radius: 6px;
`;

export const Spinner = styled.span`
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin-right: 8px;
  vertical-align: middle;

  @keyframes spin { to { transform: rotate(360deg); } }
`;
