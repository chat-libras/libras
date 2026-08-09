import { useEffect, useState, useRef } from 'react';
import { useControlsStore } from '../../store/useControlsStore/index.ts';
import { DebugPanel } from '../DebugPanel/index.ts';
import { getClientEnv } from '../../env.ts';
import type { LibrasTranslatorApi } from 'libras-translator';
import { Wrap } from './styles.ts';
import { AvatarSlot } from './AvatarSlot.tsx';

interface BottomPanelProps {
  libras: LibrasTranslatorApi;
}

export function BottomPanel({ libras }: BottomPanelProps) {
  const { isLibrasOpen, isDebugOpen, librasEverOn } = useControlsStore();
  const { debugMode } = getClientEnv();

  const showAvatar = librasEverOn;
  const showDebug  = debugMode && isDebugOpen;
  const visible    = showAvatar || showDebug;
  const split      = showAvatar && showDebug;

  // Remonta AvatarSlot quando split muda → Unity reinicializa com novo tamanho
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
        <AvatarSlot key={slotKey} libras={libras} librasOn={isLibrasOpen} />
      )}
      {showDebug && <DebugPanel />}
    </Wrap>
  );
}
