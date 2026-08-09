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

export const Header = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 6px 12px;
    border-bottom: 1px solid ${theme.border};
    background: ${theme.bg.secondary};
    flex-shrink: 0;
  `}
`;

export const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const Title = styled.span`
  ${({ theme }) => css`
    font-weight: bold;
    color: ${theme.text.primary};
    flex: 1;
    font-family: inherit;
  `}
`;

export const Filters = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`;

export const FilterBtn = styled.button<{ $active: boolean; $color: string }>`
  ${({ $active, $color }) => css`
    padding: 2px 6px;
    border: 1px solid ${$color};
    border-radius: 4px;
    background: ${$active ? `color-mix(in srgb, ${$color} 20%, transparent)` : 'transparent'};
    color: ${$active ? $color : '#6b7280'};
    cursor: pointer;
    font-size: 10px;
    font-family: monospace;
    transition: all 0.15s;
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

    &:hover { background: ${theme.border}; }
  `}
`;

export const CopyBtn = styled.button`
  ${({ theme }) => css`
    padding: 2px 8px;
    background: ${theme.bg.tertiary};
    border: 1px solid ${theme.border};
    border-radius: 4px;
    color: ${theme.text.secondary};
    cursor: pointer;
    font-size: 12px;
    flex-shrink: 0;

    &:hover { background: ${theme.border}; }
  `}
`;

export const DateFilters = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
`;

export const DateInput = styled.input`
  ${({ theme }) => css`
    padding: 2px 6px;
    background: ${theme.bg.tertiary};
    border: 1px solid ${theme.border};
    border-radius: 4px;
    color: ${theme.text.secondary};
    font-size: 10px;
    font-family: monospace;
    cursor: pointer;
    &::-webkit-calendar-picker-indicator { filter: invert(0.5); }
  `}
`;

export const DateLabel = styled.span`
  ${({ theme }) => css`
    color: ${theme.text.muted};
    font-size: 10px;
    flex-shrink: 0;
  `}
`;

export const Spinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: #6b7280;
  font-size: 12px;
  gap: 8px;

  &::before {
    content: '';
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid #6b7280;
    border-top-color: #60a5fa;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  flex: 1;
`;

export const Empty = styled.li`
  ${({ theme }) => css`
    padding: 16px;
    color: ${theme.text.muted};
    text-align: center;
  `}
`;

export const EventRow = styled.li`
  ${({ theme }) => css`
    display: grid;
    grid-template-columns: 52px 54px 60px 1fr 68px;
    gap: 4px;
    padding: 3px 12px;
    border-bottom: 1px solid ${theme.bg.tertiary};
    align-items: baseline;
    white-space: nowrap;

    &:hover {
      background: ${theme.bg.tertiary};
    }
  `}
`;

export const ColOrigin = styled.span`
  ${({ theme }) => css`
    color: ${theme.text.muted};
    font-size: 10px;
  `}
`;

export const ColRole = styled.span<{ $color: string }>`
  ${({ $color }) => css`
    font-weight: bold;
    color: ${$color};
    overflow: hidden;
    text-overflow: ellipsis;
  `}
`;

export const ColCategory = styled.span<{ $color: string }>`
  ${({ $color }) => css`
    font-weight: bold;
    color: ${$color};
  `}
`;

export const ColInfo = styled.span`
  ${({ theme }) => css`
    color: ${theme.text.primary};
    overflow: hidden;
    text-overflow: ellipsis;
  `}
`;

export const ColTs = styled.span`
  ${({ theme }) => css`
    color: ${theme.text.muted};
    text-align: right;
  `}
`;

export const DetailsRow = styled.li`
  ${({ theme }) => css`
    padding: 2px 12px 4px 136px;
    font-size: 10px;
    color: ${theme.text.muted};
    border-bottom: 1px solid ${theme.bg.tertiary};
    white-space: pre-wrap;
    word-break: break-all;
  `}
`;
