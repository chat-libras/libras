// Armazena eventos de debug in-memory. Resetado ao reiniciar o servidor.
// Limite de 500 eventos para não crescer indefinidamente.

export interface DebugEvent {
  id: string;
  ts: number;
  roomId: string;
  peerId: string;
  role: string;
  category: string;
  type: string;
  payload: Record<string, unknown>;
}

const MAX_EVENTS = 500;
const store: DebugEvent[] = [];

let idCounter = 0;

export function pushDebugEvent(event: Omit<DebugEvent, 'id' | 'ts'>): DebugEvent {
  const full: DebugEvent = {
    ...event,
    id: `dbg-${Date.now()}-${++idCounter}`,
    ts: Date.now(),
  };
  store.push(full);
  if (store.length > MAX_EVENTS) store.splice(0, store.length - MAX_EVENTS);
  return full;
}

export function getDebugEvents(roomId: string, since?: number): DebugEvent[] {
  return store.filter(
    (e) => e.roomId === roomId && (since == null || e.ts > since),
  );
}

export function clearDebugEvents(roomId: string): void {
  const toRemove = store.filter((e) => e.roomId === roomId);
  toRemove.forEach((e) => store.splice(store.indexOf(e), 1));
}
