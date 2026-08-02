import { useState, useEffect, useRef } from 'react';
import { debugBus, type DebugEvent, type DebugCategory } from './event-bus.ts';

const MAX_EVENTS = 500;

export function useDebugEvents(filter?: DebugCategory[]) {
  const [events, setEvents] = useState<DebugEvent[]>([]);
  const filterRef = useRef(filter);
  filterRef.current = filter;

  useEffect(() => {
    return debugBus.subscribe((event) => {
      setEvents((prev) => {
        // Deduplicação por id — debug:history reenvia eventos já vistos
        if (prev.some((e) => e.id === event.id)) return prev;
        return [event, ...prev].slice(0, MAX_EVENTS);
      });
    });
  }, []);

  // Aplica filtro de categoria nos eventos já coletados (reativo sem re-subscribe)
  const filtered = filter
    ? events.filter((e) => filter.includes(e.category))
    : events;

  const clear = () => setEvents([]);
  return { events: filtered, clear };
}
