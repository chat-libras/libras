// Envia eventos de debug para o servidor via WebSocket.
// Só opera quando VITE_DEBUG_MODE=true.

import { getClientEnv } from '../env.ts';

let _ws: WebSocket | null = null;
let _peerId = '';
let _role = '';
let _enabled = false;
let _initialized = false;

export function initDebugEmitter(ws: WebSocket, peerId: string, role: string): void {
  if (_initialized && _ws === ws) return; // já inicializado para este ws
  _enabled = getClientEnv().debugMode;
  _ws = ws;
  _peerId = peerId;
  _role = role;
  _initialized = true;

  if (_enabled) {
    // WS já está OPEN quando este hook roda (setWs só é chamado no onopen)
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'debug:subscribe' }));
    } else {
      // Fallback: aguarda abertura
      ws.addEventListener('open', () => {
        ws.send(JSON.stringify({ type: 'debug:subscribe' }));
      }, { once: true });
    }
  }
}

export function emitDebugEvent(
  category: string,
  eventType: string,
  payload: Record<string, unknown> = {},
): void {
  if (!_enabled || !_ws || _ws.readyState !== WebSocket.OPEN) return;
  _ws.send(
    JSON.stringify({
      type: 'debug:event',
      category,
      eventType,
      payload: { ...payload, _peerId, _role },
    }),
  );
}

export function isDebugMode(): boolean {
  return _enabled;
}
