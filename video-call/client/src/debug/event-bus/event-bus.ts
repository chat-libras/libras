import type { DebugCategory, DebugEvent, DebugEventListener } from './event-bus.types.ts';

const listeners = new Set<DebugEventListener>();
let enabled = false;

const MAX_BUFFER = 500;
const buffer: DebugEvent[] = [];

function pushToBuffer(event: DebugEvent): void {
  const idx = buffer.findIndex((e) => e.id === event.id);
  if (idx !== -1) return;
  buffer.unshift(event);
  if (buffer.length > MAX_BUFFER) buffer.length = MAX_BUFFER;
}

export const debugBus = {
  enable: () => { enabled = true; },
  disable: () => { enabled = false; },
  isEnabled: () => enabled,

  getBuffer: (): DebugEvent[] => [...buffer],

  emit(
    category: DebugCategory,
    info: string,
    payload: Record<string, unknown> = {},
    opts?: { origin?: 'client' | 'server'; role?: string; details?: Record<string, unknown> },
  ): void {
    if (!enabled) return;
    const event: DebugEvent = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      origin: opts?.origin ?? 'client',
      role: opts?.role ?? (payload['_role'] as string | undefined) ?? '',
      category,
      info,
      type: info,
      payload,
      details: opts?.details ?? null,
      ts: Date.now(),
    };
    pushToBuffer(event);
    listeners.forEach((l) => l(event));
  },

  inject(event: DebugEvent): void {
    pushToBuffer(event);
    if (enabled) listeners.forEach((l) => l(event));
  },

  subscribe(listener: DebugEventListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
