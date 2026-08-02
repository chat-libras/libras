import { useState, useEffect, useRef } from 'react';
import { debugBus, type DebugEvent, type DebugCategory } from './event-bus.ts';

const MAX_EVENTS = 200;

export function useDebugEvents(filter?: DebugCategory[]) {
  const [events, setEvents] = useState<DebugEvent[]>([]);
  const filterRef = useRef(filter);
  filterRef.current = filter;

  useEffect(() => {
    return debugBus.subscribe((event) => {
      // Usa ref para sempre ter o filtro mais recente sem re-subscribing
      const f = filterRef.current;
      if (f && !f.includes(event.category)) return;
      setEvents((prev) => [event, ...prev].slice(0, MAX_EVENTS));
    });
  }, []); // subscribe uma única vez; filtro via ref

  // Filtra os eventos já recebidos quando o filtro muda
  const filtered = filter
    ? events.filter((e) => filter.includes(e.category))
    : events;

  const clear = () => setEvents([]);
  return { events: filtered, clear };
}
