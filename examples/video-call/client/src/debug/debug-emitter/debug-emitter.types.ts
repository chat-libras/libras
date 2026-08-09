import type { DebugCategory } from '../event-bus/event-bus.types.ts';

export interface DebugEmitterConfig {
  ws: WebSocket;
  peerId: string;
  role: string;
  debugMode: boolean;
}

export type EmitDebugEventFn = (
  category: DebugCategory | string,
  info: string,
  details?: Record<string, unknown>,
  origin?: 'client' | 'server',
) => void;
