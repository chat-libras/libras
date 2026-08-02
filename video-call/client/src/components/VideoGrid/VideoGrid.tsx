import { useState } from 'react';
import styled, { css } from 'styled-components';
import type { PeerInfo } from '../../hooks/useWebRTC.ts';
import { debugBus } from '../../debug/event-bus.ts';

// ── Styled ──────────────────────────────────────────────────────────────────

const Grid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  background: ${({ theme }) => theme.bg.primary};
  border-radius: 8px;
  min-height: 180px;
`;

const Spotlight = styled.div`
  display: flex;
  gap: 8px;
  background: ${({ theme }) => theme.bg.primary};
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
  min-height: 300px;
`;

const SpotlightMain = styled.div`
  flex: 1;
  min-width: 0;
  .video-tile { width: 100%; height: 100%; border-radius: 6px; }
`;

const SpotlightSidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 8px 8px 0;
  width: 160px;
  overflow-y: auto;
  .video-tile { width: 100%; height: 110px; flex-shrink: 0; }
`;

const Tile = styled.div<{ $clickable?: boolean; $pinned?: boolean }>`
  position: relative;
  width: 240px;
  height: 160px;
  background: ${({ theme }) => theme.bg.tile};
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.border};
  transition: border-color 0.15s;

  ${({ $clickable }) => $clickable && css`cursor: pointer;`}
  ${({ $clickable, theme }) => $clickable && css`&:hover { border-color: ${theme.btn.active.bg}; }`}
  ${({ $pinned, theme }) => $pinned && css`border-color: ${theme.btn.active.bg}; border-width: 2px;`}
`;

const TileVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const TilePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.bg.tile};

  .material-icons {
    font-size: 40px;
    color: ${({ theme }) => theme.text.muted};
  }
`;

const TileLabel = styled.span`
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

  .material-icons { font-size: 12px; vertical-align: middle; margin-right: 4px; }
`;

// ── Types ────────────────────────────────────────────────────────────────────

interface VideoGridProps {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  peers: PeerInfo[];
  myId: string;
  cameraOn: boolean;
  audioOn: boolean;
  spotlightMode: boolean;
  peerMediaState: Map<string, { cameraOn: boolean; micOn: boolean }>;
}

interface TileData {
  id: string;
  stream: MediaStream | null;
  label: string;
  isLocal: boolean;
}

// ── VideoTile ────────────────────────────────────────────────────────────────

function VideoTile({
  stream,
  label,
  muted = false,
  camOff = false,
  remote = false,
  pinned = false,
  onClick,
}: {
  stream: MediaStream | null;
  label: string;
  muted?: boolean;
  camOff?: boolean;
  remote?: boolean;
  pinned?: boolean;
  onClick?: () => void;
}) {
  const attachStream = (el: HTMLVideoElement | null) => {
    if (el && stream) el.srcObject = stream;
  };

  return (
    <Tile
      className="video-tile"
      $clickable={!!onClick}
      $pinned={pinned}
      onClick={onClick}
      title={onClick ? (pinned ? 'Clique para desafixar' : 'Clique para fixar') : undefined}
    >
      {stream && !camOff ? (
        <TileVideo
          ref={attachStream}
          autoPlay
          playsInline
          muted={muted}
          {...(remote ? { 'data-remote': 'true' } : {})}
        />
      ) : (
        <TilePlaceholder>
          <span className="material-icons">
            {camOff ? 'videocam_off' : 'person'}
          </span>
        </TilePlaceholder>
      )}
      <TileLabel>
        {pinned && <span className="material-icons">push_pin</span>}
        {label}
      </TileLabel>
    </Tile>
  );
}

// ── VideoGrid ────────────────────────────────────────────────────────────────

export function VideoGrid({
  localStream,
  remoteStreams,
  peers,
  peerMediaState,
  myId,
  cameraOn,
  audioOn,
  spotlightMode,
}: VideoGridProps) {
  const [pinnedId, setPinnedId] = useState<string | null>(null);

  const localTile: TileData = {
    id: myId,
    stream: localStream,
    label: `Você (${myId.slice(0, 6)})`,
    isLocal: true,
  };

  const remoteTiles: TileData[] = peers.map((peer) => ({
    id: peer.id,
    stream: remoteStreams.get(peer.id) ?? null,
    label: `${peer.role ?? 'peer'} (${peer.id.slice(0, 6)})`,
    isLocal: false,
  }));

  const allTiles = [localTile, ...remoteTiles];

  const tileProps = (t: TileData) => ({
    camOff: t.isLocal ? !cameraOn : !(peerMediaState.get(t.id)?.cameraOn ?? false),
    muted: t.isLocal ? true : !audioOn,
  });

  if (!spotlightMode) {
    return (
      <Grid>
        {allTiles.map((t) => (
          <VideoTile key={t.id} stream={t.stream} label={t.label} remote={!t.isLocal} {...tileProps(t)} />
        ))}
      </Grid>
    );
  }

  const autoSpotlight = remoteTiles.length === 1;
  const spotlightId = pinnedId ?? (autoSpotlight ? remoteTiles[0].id : null);
  const spotlightTile = allTiles.find((t) => t.id === spotlightId) ?? allTiles[0];
  const sideTiles = allTiles.filter((t) => t.id !== spotlightTile.id);

  const handlePin = (id: string) => {
    if (autoSpotlight) return;
    const next = pinnedId === id ? null : id;
    setPinnedId(next);
    debugBus.emit('ui', next ? 'tile:pinned' : 'tile:unpinned', { peerId: id });
  };

  return (
    <Spotlight>
      <SpotlightMain>
        <VideoTile
          stream={spotlightTile.stream}
          label={spotlightTile.label}
          remote={!spotlightTile.isLocal}
          pinned={pinnedId === spotlightTile.id}
          onClick={autoSpotlight ? undefined : () => handlePin(spotlightTile.id)}
          {...tileProps(spotlightTile)}
        />
      </SpotlightMain>

      {sideTiles.length > 0 && (
        <SpotlightSidebar>
          {sideTiles.map((t) => (
            <VideoTile
              key={t.id}
              stream={t.stream}
              label={t.label}
              remote={!t.isLocal}
              pinned={pinnedId === t.id}
              onClick={() => handlePin(t.id)}
              {...tileProps(t)}
            />
          ))}
        </SpotlightSidebar>
      )}
    </Spotlight>
  );
}
