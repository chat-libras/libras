import { create } from 'zustand';
import { randomUUID } from '../../utils/uuid/index.ts';
import type { ToastState } from './useToastStore.types.ts';

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  push(message, variant = 'info', duration = 4000) {
    const id = randomUUID();
    set((s) => ({ toasts: [...s.toasts, { id, message, variant, duration }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, duration);
  },

  dismiss(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));

export const toast = {
  info:    (msg: string, duration?: number) => useToastStore.getState().push(msg, 'info', duration),
  success: (msg: string, duration?: number) => useToastStore.getState().push(msg, 'success', duration),
  warning: (msg: string, duration?: number) => useToastStore.getState().push(msg, 'warning', duration),
  error:   (msg: string, duration?: number) => useToastStore.getState().push(msg, 'error', duration),
};
