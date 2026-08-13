import styled from 'styled-components';

export const Card = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #0f172a;
  border: 1px solid #334155;
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
  color: #64748b;
`;

export const Name = styled.span`
  font-size: 14px;
  color: #f1f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Actions = styled.div`
  display: flex;
  gap: 6px;
  flex-shrink: 0;
`;

export const OpenLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #1d4ed8;
  border: 1px solid #2563eb;
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s;

  &:hover {
    background: #2563eb;
  }

  .material-icons { font-size: 16px; }
`;

export const ActionBtn = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: ${({ $primary }) => ($primary ? '#1d4ed8' : '#1e293b')};
  border: 1px solid ${({ $primary }) => ($primary ? '#2563eb' : '#334155')};
  border-radius: 6px;
  color: ${({ $primary }) => ($primary ? '#fff' : '#94a3b8')};
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: ${({ $primary }) => ($primary ? '#2563eb' : '#334155')};
    color: #f1f5f9;
  }

  .material-icons { font-size: 16px; }
`;
