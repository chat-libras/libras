import type { DebugCategory } from '../event-bus/event-bus.types.ts';

export interface UseDebugEventsOptions {
  filter?: DebugCategory[];
}

export interface UseDebugEventsResult {
  events: import('../event-bus/event-bus.types.ts').DebugEvent[];
  clear: () => void;
  loading: boolean;
}
