export type DebugCategory = 'audio' | 'libras' | 'socket' | 'focus' | 'media' | 'ui' | 'system' | 'vad' | 'stt' | 'glosa';

export interface DebugEvent {
  id: string;
  /** client | server */
  origin: 'client' | 'server';
  /** role do peer que gerou o evento */
  role: string;
  category: DebugCategory;
  /** título/chave do evento, ex: audio_sent, camera:on */
  info: string;
  /** campo legado mantido para compatibilidade interna */
  type: string;
  /** payload legado */
  payload: Record<string, unknown>;
  /** conteúdo adicional estruturado */
  details: Record<string, unknown> | null;
  ts: number;
}

type Listener = (event: DebugEvent) => void;
const listeners = new Set<Listener>();
let enabled = false;

export const debugBus = {
  enable: () => { enabled = true; },
  disable: () => { enabled = false; },
  isEnabled: () => enabled,

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
    listeners.forEach((l) => l(event));
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
