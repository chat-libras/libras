import { useState } from 'react';
import type { PeerInfo } from '../../hooks/useWebRTC.ts';
import { debugBus } from '../../debug/event-bus.ts';
import { VideoTile } from './VideoTile.tsx';
import { Grid, Spotlight, SpotlightMain, SpotlightSidebar } from './styles.ts';

export interface VideoGridProps {
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

function roleLabel(role: string | undefined) {
  const labels: Record<string, string> = {
    patient:      'Paciente',
    professional: 'Médico',
  };
  return role ? (labels[role] ?? role) : 'peer';
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
    label: `${roleLabel(peer.role)} (${peer.id.slice(0, 6)})`,
    isLocal: false,
  }));

  const allTiles = [localTile, ...remoteTiles];

  const tileProps = (t: TileData) => ({
    camOff: t.isLocal ? !cameraOn : !(peerMediaState.get(t.id)?.cameraOn ?? true),
    muted:  t.isLocal ? true : !audioOn,
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
  const spotlightId   = pinnedId ?? (autoSpotlight ? remoteTiles[0].id : null);
  const spotlightTile = allTiles.find((t) => t.id === spotlightId) ?? allTiles[0];
  const sideTiles     = allTiles.filter((t) => t.id !== spotlightTile.id);

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
