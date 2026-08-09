import styled from 'styled-components';

// ── Formulário / inputs compartilhados entre páginas de lobby ────────────────

export const PageInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  color: #f1f5f9;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;

  &::placeholder { color: #64748b; }
  &:focus { border-color: #3b82f6; }
`;

export const PageButton = styled.button<{ $sm?: boolean }>`
  width: 100%;
  padding: ${({ $sm }) => ($sm ? '8px 14px' : '12px')};
  background: #2563eb;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: ${({ $sm }) => ($sm ? '13px' : '15px')};
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;

  &:hover:not(:disabled) { background: #1d4ed8; }
  &:disabled { background: #334155; cursor: not-allowed; }
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
