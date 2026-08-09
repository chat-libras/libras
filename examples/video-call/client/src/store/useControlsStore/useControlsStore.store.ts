import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { debugBus } from '../../debug/event-bus/index.ts';
import type { ControlsState } from './useControlsStore.types.ts';
export type { ControlsState } from './useControlsStore.types.ts';

const INITIAL_STATE = {
  isMicEnabled: false,
  isCameraEnabled: false,
  isSoundEnabled: true,
  isLibrasOpen: false,
  isChatOpen: false,
  isDebugOpen: false,
  librasEverOn: false,
};

export const useControlsStore = create<ControlsState>()(
  subscribeWithSelector((set) => ({
    ...INITIAL_STATE,

    toggleMic: () => set((s) => {
      const next = !s.isMicEnabled;
      debugBus.emit('toggle', 'mic:toggle', { value: next });
      return { isMicEnabled: next };
    }),

    toggleCamera: () => set((s) => {
      const next = !s.isCameraEnabled;
      debugBus.emit('toggle', 'camera:toggle', { value: next });
      return { isCameraEnabled: next };
    }),

    toggleSound: () => set((s) => {
      const next = !s.isSoundEnabled;
      debugBus.emit('toggle', 'remote-audio:toggle', { value: next });
      return { isSoundEnabled: next };
    }),

    toggleLibras: () => set((s) => {
      const next = !s.isLibrasOpen;
      debugBus.emit('toggle', 'libras:toggle', { value: next });
      return {
        isLibrasOpen: next,
        librasEverOn: s.librasEverOn || next,
      };
    }),

    toggleChat: () => set((s) => {
      const next = !s.isChatOpen;
      debugBus.emit('toggle', 'chat:toggle', { open: next });
      return { isChatOpen: next, isDebugOpen: next ? false : s.isDebugOpen };
    }),

    toggleDebug: () => set((s) => {
      const next = !s.isDebugOpen;
      debugBus.emit('toggle', 'debug:toggle', { open: next });
      return { isDebugOpen: next, isChatOpen: next ? false : s.isChatOpen };
    }),

    resetControls: () => set(INITIAL_STATE),
  })),
);
