import styled from 'styled-components';

export const Card = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 10px 12px;
  gap: 8px;
`;

export const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

export const Role = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.text.muted};
`;

export const Name = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Actions = styled.div`
  display: flex;
  gap: 6px;
  flex-shrink: 0;
`;

export const ActionBtn = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: ${({ $primary, theme }) => ($primary ? theme.btn.active.bg : theme.bg.secondary)};
  border: 1px solid ${({ $primary, theme }) => ($primary ? theme.btn.active.hover : theme.border)};
  border-radius: 6px;
  color: ${({ $primary, theme }) => ($primary ? '#fff' : theme.text.secondary)};
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: ${({ $primary, theme }) => ($primary ? theme.btn.active.hover : theme.bg.tertiary)};
    color: ${({ theme }) => theme.text.primary};
  }

  .material-icons { font-size: 16px; }
`;
