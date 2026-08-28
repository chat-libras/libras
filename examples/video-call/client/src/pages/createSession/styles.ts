import styled from 'styled-components';

export const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.bg.primary};
`;

export const Card = styled.div`
  background: ${({ theme }) => theme.bg.secondary};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 32px 28px;
  width: 100%;
  max-width: 400px;
`;

export const Title = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: 4px;
`;

export const Subtitle = styled.p`
  color: ${({ theme }) => theme.text.muted};
  font-size: 13px;
  margin-bottom: 24px;
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const Desc = styled.p`
  color: ${({ theme }) => theme.text.secondary};
  font-size: 14px;
  line-height: 1.6;
`;
