import styled, { css } from 'styled-components';

export const Wrap = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    height: 100%;
    background: ${theme.bg.card};
    border: 1px solid ${theme.border};
    border-radius: 8px;
    overflow: hidden;
    font-family: monospace;
    font-size: 11px;
  `}
`;

export const ConsoleHeader = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-bottom: 1px solid ${theme.border};
    background: ${theme.bg.secondary};
    flex-shrink: 0;
    min-height: 42px;
  `}
`;

export const ConsoleTitle = styled.span`
  ${({ theme }) => css`
    font-weight: bold;
    color: ${theme.text.primary};
    flex: 1;
    font-family: inherit;
  `}
`;

export const ConsoleCount = styled.span`
  ${({ theme }) => css`
    font-size: 10px;
    color: ${theme.text.muted};
  `}
`;

export const ClearBtn = styled.button`
  ${({ theme }) => css`
    padding: 2px 8px;
    background: ${theme.bg.tertiary};
    border: 1px solid ${theme.border};
    border-radius: 4px;
    color: ${theme.text.secondary};
    cursor: pointer;
    font-size: 10px;
    font-family: monospace;
    flex-shrink: 0;

    &:hover {
      background: ${theme.border};
    }
  `}
`;

export const EventList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  flex: 1;
`;

export const EmptyItem = styled.li`
  ${({ theme }) => css`
    padding: 16px;
    color: ${theme.text.muted};
    text-align: center;
  `}
`;

export const EventItem = styled.li`
  ${({ theme }) => css`
    display: grid;
    grid-template-columns: 80px 64px 1fr 1fr;
    gap: 6px;
    padding: 3px 12px;
    border-bottom: 1px solid ${theme.bg.tertiary};
    align-items: baseline;
    white-space: nowrap;

    &:hover {
      background: ${theme.bg.tertiary};
    }
  `}
`;

export const EventTs = styled.span`
  ${({ theme }) => css`
    color: ${theme.text.muted};
    font-size: 10px;
  `}
`;

export const EventCategory = styled.span<{ $color: string }>`
  ${({ $color }) => css`
    color: ${$color};
    font-weight: bold;
  `}
`;

export const EventType = styled.span`
  ${({ theme }) => css`
    color: ${theme.text.primary};
    overflow: hidden;
    text-overflow: ellipsis;
  `}
`;

export const EventPayload = styled.span`
  ${({ theme }) => css`
    color: ${theme.text.muted};
    overflow: hidden;
    text-overflow: ellipsis;
  `}
`;
