import { useEffect, useState, useRef } from 'react';
import { useCallStore } from '../../store/useCallStore.ts';
import { DebugPanel } from '../DebugPanel/index.ts';
import { getClientEnv } from '../../env.ts';
import type { LibrasAvatarApi } from 'libras-translator';
import { Wrap } from './styles.ts';
import { AvatarSlot } from './AvatarSlot.tsx';

interface BottomPanelProps {
  avatar: LibrasAvatarApi;
  debugOpen: boolean;
}

export function BottomPanel({ avatar, debugOpen }: BottomPanelProps) {
  const { librasOn } = useCallStore();
  const { debugMode } = getClientEnv();

  const [librasEverOn, setLibrasEverOn] = useState(false);
  useEffect(() => {
    if (librasOn && !librasEverOn) setLibrasEverOn(true);
  }, [librasOn, librasEverOn]);

  const showAvatar = librasEverOn;
  const showDebug  = debugMode && debugOpen;
  const visible    = showAvatar || showDebug;
  const split      = showAvatar && showDebug;

  // Incrementa key quando split muda → React desmonta/remonta AvatarSlot
  // → containerRef chamado com null depois com novo elemento → Unity reinicializa
  const [slotKey, setSlotKey] = useState(0);
  const prevSplitRef = useRef(split);
  useEffect(() => {
    if (prevSplitRef.current !== split) {
      prevSplitRef.current = split;
      setSlotKey((k) => k + 1);
    }
  }, [split]);

  return (
    <Wrap $visible={visible} $split={split}>
      {showAvatar && (
        <AvatarSlot key={slotKey} avatar={avatar} librasOn={librasOn} />
      )}
      {showDebug && <DebugPanel />}
    </Wrap>
  );
}
