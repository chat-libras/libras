export interface DebugConsoleEvent {
  id: string;
  ts: number;
  roomId: string;
  peerId: string;
  role: string;
  category: string;
  type: string;
  payload: Record<string, unknown>;
}

export interface UseDebugConsoleOptions {
  ws: WebSocket | null;
  enabled: boolean;
  autoOpen?: boolean;
}

export interface UseDebugConsoleResult {
  events: DebugConsoleEvent[];
  open: boolean;
  toggle: () => void;
  clear: () => void;
}
