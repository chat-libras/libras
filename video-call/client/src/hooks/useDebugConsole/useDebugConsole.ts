import { useState, useEffect, useCallback } from 'react';
import type {
  DebugConsoleEvent,
  UseDebugConsoleOptions,
  UseDebugConsoleResult,
} from './useDebugConsole.types.ts';

export function useDebugConsole({ ws, enabled, autoOpen = false }: UseDebugConsoleOptions): UseDebugConsoleResult {
  const [events, setEvents] = useState<DebugConsoleEvent[]>([]);
  const [open, setOpen] = useState(autoOpen);

  useEffect(() => {
    if (!ws || !enabled) return;

    const handler = (raw: MessageEvent<string>) => {
      let msg: { type: string } & Record<string, unknown>;
      try {
        msg = JSON.parse(raw.data) as { type: string } & Record<string, unknown>;
      } catch {
        return;
      }
      if (msg.type === 'debug:history') {
        setEvents((msg['events'] as DebugConsoleEvent[]) ?? []);
      } else if (msg.type === 'debug:broadcast') {
        setEvents((prev) => [...prev, msg['event'] as DebugConsoleEvent]);
      }
    };

    ws.addEventListener('message', handler);
    return () => ws.removeEventListener('message', handler);
  }, [ws, enabled]);

  const clear = useCallback(() => {
    setEvents([]);
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'debug:clear' }));
    }
  }, [ws]);

  const toggle = useCallback(() => setOpen((v) => !v), []);

  return { events, open, toggle, clear };
}
