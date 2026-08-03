import styled from 'styled-components';

export const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Card = styled.div`
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 32px 28px;
  width: 100%;
  max-width: 400px;
`;

export const Title = styled.h1`
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 4px;
`;

export const Subtitle = styled.p`
  color: #64748b;
  font-size: 13px;
  margin-bottom: 24px;
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const Desc = styled.p`
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.6;
`;
