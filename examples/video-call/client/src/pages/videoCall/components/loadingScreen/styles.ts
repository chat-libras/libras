import styled, { keyframes } from 'styled-components';

const spin = keyframes`to { transform: rotate(360deg); }`;

export const Gate = styled.div<{ $error?: boolean }>`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: #0f172a;
  color: ${({ $error }) => ($error ? '#f87171' : '#94a3b8')};
`;

export const SpinnerRing = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #334155;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

export const Label = styled.p`
  font-size: 15px;
`;

export const ErrorIcon = styled.span`
  font-size: 48px;
`;

export const BackBtn = styled.button`
  margin-top: 8px;
  padding: 10px 20px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  color: #f1f5f9;
  font-size: 14px;
  cursor: pointer;

  &:hover { background: #334155; }
`;
