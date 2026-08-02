import styled, { css } from 'styled-components';

export const Grid = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px;
    background: ${theme.bg.primary};
    border-radius: 8px;
    min-height: 180px;
  `}
`;

export const Spotlight = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: 8px;
    background: ${theme.bg.primary};
    border-radius: 8px;
    overflow: hidden;
    height: 100%;
    min-height: 300px;
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
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const TilePlaceholder = styled.div`
  ${({ theme }) => css`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${theme.bg.tile};

    .material-icons {
      font-size: 40px;
      color: ${theme.text.muted};
    }
  `}
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
