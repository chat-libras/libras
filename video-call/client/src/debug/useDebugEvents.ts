import { useState, useEffect } from 'react';
import { debugBus, type DebugEvent, type DebugCategory } from './event-bus.ts';

const MAX_EVENTS = 100;

export function useDebugEvents(filter?: DebugCategory[]) {
  const [events, setEvents] = useState<DebugEvent[]>([]);

  useEffect(() => {
    return debugBus.subscribe((event) => {
      if (filter && !filter.includes(event.category)) return;
      setEvents((prev) => [event, ...prev].slice(0, MAX_EVENTS));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clear = () => setEvents([]);
  return { events, clear };
}
