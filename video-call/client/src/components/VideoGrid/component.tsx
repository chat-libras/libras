import { useState } from 'react';
import type { PeerInfo } from '../../hooks/useWebRTC.ts';
import { debugBus } from '../../debug/event-bus.ts';
import {
  Grid, Spotlight, SpotlightMain, SpotlightSidebar,
  Tile, TileVideo, TilePlaceholder, TileLabel,
} from './styles.ts';

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

function VideoTile({
  stream, label, muted = false, camOff = false, remote = false, pinned = false, onClick,
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
          <span className="material-icons">{camOff ? 'videocam_off' : 'person'}</span>
        </TilePlaceholder>
      )}
      <TileLabel>
        {pinned && <span className="material-icons">push_pin</span>}
        {label}
      </TileLabel>
    </Tile>
  );
}

export function VideoGrid({
  localStream, remoteStreams, peers, peerMediaState,
  myId, cameraOn, audioOn, spotlightMode,
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
