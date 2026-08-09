import styled from 'styled-components';

export const Layout = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 48px;
  background: #1e293b;
  border-bottom: 1px solid #334155;
  flex-shrink: 0;
`;

export const HeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const Room = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #f1f5f9;
`;

export const Role = styled.span`
  font-size: 12px;
  color: #94a3b8;
`;

export const Status = styled.span<{ $connected: boolean }>`
  font-size: 12px;
  color: ${({ $connected }) => ($connected ? '#4ade80' : '#fbbf24')};
`;

export const DebugBadge = styled.span`
  font-size: 11px;
  background: #7c3aed;
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
`;

export const ThemeBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid #334155;
  border-radius: 6px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.15s;

  &:hover { background: #334155; color: #f1f5f9; }
  .material-icons { font-size: 18px; }
`;

export const ErrorBanner = styled.div`
  padding: 8px 16px;
  background: #7f1d1d;
  color: #fca5a5;
  font-size: 13px;
  flex-shrink: 0;
`;

export const Body = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
`;

export const Main = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

export const VideoGridWrapper = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;
