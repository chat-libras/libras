import { useEffect, useState, useRef } from "react";
import { useControlsStore } from "../../store/useControlsStore/index.ts";
import { DebugPanel } from "../DebugPanel/index.ts";
import { getClientEnv } from "../../env.ts";
import type { LibrasAvatarApi } from "libras-translator";
import { Wrap } from "./styles.ts";
import { AvatarSlot } from "./AvatarSlot.tsx";

interface BottomPanelProps {
  avatar: LibrasAvatarApi;
}

export function BottomPanel({ avatar }: BottomPanelProps) {
  const { isLibrasOpen, isDebugOpen, librasEverOn, isChatOpen } =
    useControlsStore();
  const { debugMode } = getClientEnv();

  const showAvatar = librasEverOn;
  const showDebug = debugMode && isDebugOpen;
  const visible = showAvatar || showDebug;
  const split = showAvatar && showDebug;

  const prevSplitRef = useRef({ isLibrasOpen, isDebugOpen, isChatOpen });

  // Remonta AvatarSlot quando split muda → Unity reinicializa com novo tamanho
  const [slotKey, setSlotKey] = useState(0);
  useEffect(() => {
    if (!isLibrasOpen) {
      return;
    }

    let shouldEvaluate = false;

    if (prevSplitRef.current.isChatOpen !== isChatOpen) {
      shouldEvaluate = true;
    }

    if (prevSplitRef.current.isDebugOpen !== isDebugOpen) {
      shouldEvaluate = true;
    }

    if (prevSplitRef.current.isLibrasOpen !== isLibrasOpen) {
      shouldEvaluate = true;
    }

    if (shouldEvaluate) {
      prevSplitRef.current = { isLibrasOpen, isDebugOpen, isChatOpen };
      setSlotKey((k) => k + 1);
    }
  }, [isLibrasOpen, isDebugOpen, isChatOpen]);

  return (
    <Wrap $visible={visible} $split={split}>
      {showAvatar && (
        <AvatarSlot key={slotKey} avatar={avatar} librasOn={isLibrasOpen} />
      )}
      {showDebug && <DebugPanel />}
    </Wrap>
  );
}
