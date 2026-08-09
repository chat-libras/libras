export type DebugCategory = 'audio' | 'libras' | 'socket' | 'focus' | 'media' | 'ui' | 'system' | 'vad' | 'stt' | 'glosa' | 'toggle';

export interface DebugEvent {
  id: string;
  origin: 'client' | 'server';
  role: string;
  category: DebugCategory;
  info: string;
  /** @deprecated use info */
  type: string;
  /** @deprecated use details */
  payload: Record<string, unknown>;
  details: Record<string, unknown> | null;
  ts: number;
}

export type DebugEventListener = (event: DebugEvent) => void;
