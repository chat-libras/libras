import { create } from 'zustand';
import { randomUUID } from '../utils/uuid.ts';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  /** ms — padrão 4000 */
  duration: number;
}

interface ToastStore {
  toasts: Toast[];
  push: (message: string, variant?: ToastVariant, duration?: number) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
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

/** Atalhos para não importar o store diretamente em hooks de infra */
export const toast = {
  info:    (msg: string, duration?: number) => useToastStore.getState().push(msg, 'info', duration),
  success: (msg: string, duration?: number) => useToastStore.getState().push(msg, 'success', duration),
  warning: (msg: string, duration?: number) => useToastStore.getState().push(msg, 'warning', duration),
  error:   (msg: string, duration?: number) => useToastStore.getState().push(msg, 'error', duration),
};
