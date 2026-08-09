import styled, { css } from 'styled-components';

export const Wrap = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    height: 100%;
    background: ${theme.bg.card};
    border: 1px solid ${theme.border};
    border-right: 0;
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
    overflow: hidden;
  `}
`;

export const Header = styled.div`
  ${({ theme }) => css`
    padding: 10px 12px;
    background: ${theme.bg.secondary};
    border-bottom: 1px solid ${theme.border};
    font-weight: 600;
    font-size: 13px;
    color: ${theme.text.primary};
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
    min-height: 48px;
    flex-shrink: 0;
  `}
`;

export const PeerCount = styled.span`
  ${({ theme }) => css`
    font-size: 11px;
    color: ${theme.text.secondary};
  `}
`;

export const Messages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Msg = styled.div<{ $mine: boolean }>`
  ${({ $mine }) => css`
    display: flex;
    flex-direction: column;
    max-width: 85%;
    gap: 2px;
    align-self: ${$mine ? 'flex-end' : 'flex-start'};
    align-items: ${$mine ? 'flex-end' : 'flex-start'};
  `}
`;

export const MsgSender = styled.span`
  ${({ theme }) => css`
    font-size: 10px;
    color: ${theme.text.muted};
  `}
`;

export const MsgText = styled.span<{ $mine: boolean }>`
  ${({ theme, $mine }) => css`
    padding: 7px 10px;
    border-radius: 8px;
    font-size: 13px;
    line-height: 1.4;
    word-break: break-word;
    background: ${$mine ? theme.chat.mine.bg : theme.chat.theirs.bg};
    color: ${$mine ? theme.chat.mine.color : theme.chat.theirs.color};
  `}
`;

export const MsgTs = styled.span`
  ${({ theme }) => css`
    font-size: 10px;
    color: ${theme.text.muted};
  `}
`;

export const InputRow = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: 6px;
    padding: 10px;
    border-top: 1px solid ${theme.border};
    flex-shrink: 0;
  `}
`;

export const Textarea = styled.textarea`
  ${({ theme }) => css`
    flex: 1;
    background: ${theme.chat.input};
    border: 1px solid ${theme.border};
    border-radius: 6px;
    color: ${theme.text.primary};
    padding: 8px 10px;
    font-size: 13px;
    resize: none;
    font-family: inherit;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &::placeholder {
      color: ${theme.text.muted};
    }
  `}
`;

export const SendBtn = styled.button`
  ${({ theme }) => css`
    width: 36px;
    height: 36px;
    background: ${theme.btn.active.bg};
    border: none;
    border-radius: 6px;
    color: ${theme.btn.active.text};
    cursor: pointer;
    font-size: 16px;
    align-self: flex-end;
    transition: opacity 0.15s;

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  `}
`;
