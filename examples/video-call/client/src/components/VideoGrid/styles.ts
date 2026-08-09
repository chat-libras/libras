import styled, { css } from 'styled-components';

export const Grid = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    gap: 8px;
    padding: 8px;
    background: ${theme.bg.primary};
    border-radius: 8px;
    flex: 1;
    min-height: 0;
  `}
`;

export const Spotlight = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: 8px;
    background: ${theme.bg.primary};
    border-radius: 8px;
    overflow: hidden;
    flex: 1;
    min-height: 0;
  `}
`;

export const SpotlightMain = styled.div`
  flex: 1;
  min-width: 0;

  .video-tile {
    width: 100%;
    height: 100%;
    border-radius: 6px;
  }
`;

export const SpotlightSidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 8px 8px 0;
  width: 160px;
  overflow-y: auto;

  .video-tile {
    width: 100%;
    height: 110px;
    flex-shrink: 0;
  }
`;

export const Tile = styled.div<{ $clickable?: boolean; $pinned?: boolean }>`
  ${({ theme, $clickable, $pinned }) => css`
    position: relative;
    width: 240px;
    height: 160px;
    background: ${theme.bg.tile};
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid ${theme.border};
    transition: border-color 0.15s;

    ${$clickable && css`cursor: pointer;`}
    ${$clickable && css`&:hover { border-color: ${theme.btn.active.bg}; }`}
    ${$pinned && css`border-color: ${theme.btn.active.bg}; border-width: 2px;`}
  `}
`;

export const TileVideo = styled.video`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
`;

export const TilePlaceholder = styled.div<{ $camOff?: boolean }>`
  ${({ theme, $camOff }) => css`
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: ${$camOff ? '#5e5e5e' : theme.bg.tile};
    z-index: 2;

    .material-icons {
      font-size: 40px;
      color: ${$camOff ? '#888' : theme.text.muted};
    }
  `}
`;

export const CamOffText = styled.span`
  color: #888;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  padding: 0 12px;
`;

export const TileLabel = styled.span`
  position: absolute;
  bottom: 6px;
  left: 8px;
  font-size: 11px;
  color: #fff;
  background: rgba(0, 0, 0, 0.6);
  padding: 2px 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;

  .material-icons {
    font-size: 12px;
    vertical-align: middle;
    margin-right: 4px;
  }
`;
