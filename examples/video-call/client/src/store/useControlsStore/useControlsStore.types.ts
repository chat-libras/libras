export interface ControlsState {
  // ── Mídia local ────────────────────────────────────────────────────────────
  isMicEnabled: boolean;
  isCameraEnabled: boolean;
  isSoundEnabled: boolean;

  // ── Painéis / UI ───────────────────────────────────────────────────────────
  isLibrasOpen: boolean;
  isChatOpen: boolean;
  isDebugOpen: boolean;

  /** Libras foi ativado ao menos uma vez — avatar não pode ser desmontado após isso */
  librasEverOn: boolean;

  // ── Actions ────────────────────────────────────────────────────────────────
  toggleMic: () => void;
  toggleCamera: () => void;
  toggleSound: () => void;
  toggleLibras: () => void;
  toggleChat: () => void;
  toggleDebug: () => void;

  resetControls: () => void;
}
