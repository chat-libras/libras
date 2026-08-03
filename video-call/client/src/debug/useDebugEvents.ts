import { useState, useEffect, useRef } from 'react';
import { debugBus, type DebugEvent, type DebugCategory } from './event-bus.ts';

const MAX_EVENTS = 500;

export function useDebugEvents(filter?: DebugCategory[]) {
  const [events, setEvents] = useState<DebugEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const filterRef = useRef(filter);
  filterRef.current = filter;

  useEffect(() => {
    // Hidrata com buffer existente
    setEvents(debugBus.getBuffer());
    setLoading(false);

    return debugBus.subscribe((event) => {
      setEvents((prev) => {
        if (prev.some((e) => e.id === event.id)) return prev;
        return [event, ...prev].slice(0, MAX_EVENTS);
      });
    });
  }, []);

  const filtered = filter
    ? events.filter((e) => filter.includes(e.category))
    : events;

  const clear = () => setEvents([]);
  return { events: filtered, clear, loading };
}
