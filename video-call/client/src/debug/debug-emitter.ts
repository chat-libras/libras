// Envia eventos de debug para o servidor via WebSocket e injeta no debugBus local.

import { getClientEnv } from '../env.ts';
import { debugBus, type DebugCategory } from './event-bus.ts';

let _ws: WebSocket | null = null;
let _peerId = '';
let _role = '';
let _enabled = false;
let _initialized = false;

export function initDebugEmitter(ws: WebSocket, peerId: string, role: string): void {
  if (_initialized && _ws === ws) return;
  _enabled = getClientEnv().debugMode;
  _ws = ws;
  _peerId = peerId;
  _role = role;
  _initialized = true;

  if (_enabled) {
    const subscribe = () => ws.send(JSON.stringify({ type: 'debug:subscribe' }));
    if (ws.readyState === WebSocket.OPEN) {
      subscribe();
    } else {
      ws.addEventListener('open', subscribe, { once: true });
    }
  }
}

export function emitDebugEvent(
  category: DebugCategory | string,
  info: string,
  details: Record<string, unknown> = {},
  origin: 'client' | 'server' = 'client',
): void {
  // Emite localmente no debugBus para exibição imediata no DebugPanel
  debugBus.emit(
    category as DebugCategory,
    info,
    { _peerId, _role, ...details },
    { origin, role: _role, details },
  );

  // Envia para o servidor para persistência e broadcast
  if (!_enabled || !_ws || _ws.readyState !== WebSocket.OPEN) return;
  _ws.send(
    JSON.stringify({
      type: 'debug:event',
      origin,
      category,
      info,
      details: { ...details, peerId: _peerId, role: _role },
    }),
  );
}

export function isDebugMode(): boolean {
  return _enabled;
}
