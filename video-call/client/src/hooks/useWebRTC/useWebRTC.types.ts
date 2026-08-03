import type { CallParams } from '../../domain/types/call.types.ts';

export type { CallParams };

export interface UseWebRTCResult {
  ws: WebSocket | null;
}
