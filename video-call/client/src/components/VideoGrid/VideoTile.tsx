import { useRef, useEffect } from 'react';
import { Tile, TileVideo, TilePlaceholder, TileLabel, CamOffText } from './styles.ts';

export interface VideoTileProps {
  stream: MediaStream | null;
  label: string;
  muted?: boolean;
  camOff?: boolean;
  remote?: boolean;
  pinned?: boolean;
  onClick?: () => void;
}

export function VideoTile({
  stream, label, muted = false, camOff = false, remote = false, pinned = false, onClick,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (!stream) {
      el.srcObject = null;
      return;
    }

    const tryPlay = () => el.play().catch(() => {
      el.muted = true;
      el.play().catch(() => {/* silencioso */});
    });

    el.srcObject = stream;
    requestAnimationFrame(() => tryPlay());

    const tracks = stream.getTracks();
    tracks.forEach((t) => t.addEventListener('unmute', tryPlay));
    stream.addEventListener('addtrack', tryPlay);

    return () => {
      tracks.forEach((t) => t.removeEventListener('unmute', tryPlay));
      stream.removeEventListener('addtrack', tryPlay);
    };
  }, [stream]);

  const showVideo = !!stream;

  return (
    <Tile
      $clickable={!!onClick}
      $pinned={pinned}
      onClick={onClick}
      title={onClick ? (pinned ? 'Clique para desafixar' : 'Clique para fixar') : undefined}
    >
      <TileVideo
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        style={{ display: showVideo && !camOff ? 'block' : 'none' }}
        {...(remote ? { 'data-remote': 'true' } : {})}
      />
      {(!showVideo || camOff) && (
        <TilePlaceholder $camOff={camOff}>
          <span className="material-icons">{camOff ? 'videocam_off' : 'person'}</span>
          {camOff && <CamOffText>Vídeo de {label} desabilitado</CamOffText>}
        </TilePlaceholder>
      )}
      <TileLabel>
        {pinned && <span className="material-icons">push_pin</span>}
        {label}
      </TileLabel>
    </Tile>
  );
}
