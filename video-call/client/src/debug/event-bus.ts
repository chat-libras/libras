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

// Buffer em memória — persiste eventos mesmo antes do painel montar
const MAX_BUFFER = 500;
const buffer: DebugEvent[] = [];

function pushToBuffer(event: DebugEvent): void {
  const idx = buffer.findIndex((e) => e.id === event.id);
  if (idx !== -1) return; // dedup
  buffer.unshift(event);
  if (buffer.length > MAX_BUFFER) buffer.length = MAX_BUFFER;
}

export const debugBus = {
  enable: () => { enabled = true; },
  disable: () => { enabled = false; },
  isEnabled: () => enabled,

  /** Retorna snapshot atual do buffer (para hidratação ao montar o painel) */
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

  /** Injeta evento já formado (vindo do servidor) preservando o id original.
   *  Funciona mesmo com debugBus desabilitado — logs do servidor sempre persistem. */
  inject(event: DebugEvent): void {
    pushToBuffer(event);
    if (enabled) listeners.forEach((l) => l(event));
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
