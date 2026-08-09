import styled from 'styled-components';

export const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 32px 16px;
`;

export const Card = styled.div`
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 32px 28px;
  width: 100%;
  max-width: 800px;
`;

export const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
`;

export const Title = styled.h1`
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 4px;
`;

export const SessionId = styled.p`
  font-family: monospace;
  font-size: 12px;
  color: #64748b;
`;

export const Panels = styled.div`
  display: flex;
  gap: 0;
`;

export const Panel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const Divider = styled.div`
  flex: 0 0 1px;
  background: #334155;
  margin: 0 20px;
`;

export const LinkList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
`;
