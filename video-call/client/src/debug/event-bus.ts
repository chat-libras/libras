export type DebugCategory = 'audio' | 'libras' | 'socket' | 'focus' | 'media' | 'ui';

export interface DebugEvent {
  id: string;
  category: DebugCategory;
  type: string;
  payload: Record<string, unknown>;
  ts: number;
}

type Listener = (event: DebugEvent) => void;
const listeners = new Set<Listener>();
let enabled = false;

export const debugBus = {
  enable: () => {
    enabled = true;
  },
  disable: () => {
    enabled = false;
  },
  isEnabled: () => enabled,

  emit(category: DebugCategory, type: string, payload: Record<string, unknown> = {}): void {
    if (!enabled) return;
    const event: DebugEvent = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      category,
      type,
      payload,
      ts: Date.now(),
    };
    listeners.forEach((l) => l(event));
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
