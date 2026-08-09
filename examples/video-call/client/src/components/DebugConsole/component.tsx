import type { DebugConsoleEvent } from '../../hooks/useDebugConsole/index.ts';
import {
  Wrap, ConsoleHeader, ConsoleTitle, ConsoleCount, ClearBtn,
  EventList, EmptyItem, EventItem, EventTs, EventCategory, EventType, EventPayload,
} from './styles.ts';

const CATEGORY_COLOR: Record<string, string> = {
  media:   '#f472b6',
  ui:      '#34d399',
  audio:   '#4ade80',
  libras:  '#60a5fa',
  socket:  '#f59e0b',
  focus:   '#a78bfa',
  vad:     '#fb923c',
  stt:     '#38bdf8',
  glosa:   '#c084fc',
  system:  '#94a3b8',
};

function formatPayload(payload: Record<string, unknown>): string {
  const { _peerId, _role, ...rest } = payload;
  void _peerId; void _role;
  const parts: string[] = [];
  Object.entries(rest).forEach(([k, v]) => {
    parts.push(`${k}=${typeof v === 'object' ? JSON.stringify(v) : String(v)}`);
  });
  return parts.join(' ');
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    fractionalSecondDigits: 3,
  });
}

interface DebugConsoleProps {
  events: DebugConsoleEvent[];
  onClear: () => void;
}

export function DebugConsole({ events, onClear }: DebugConsoleProps) {
  return (
    <Wrap>
      <ConsoleHeader>
        <ConsoleTitle>🔬 Debug Console</ConsoleTitle>
        <ConsoleCount>{events.length} eventos</ConsoleCount>
        <ClearBtn onClick={onClear}>Limpar</ClearBtn>
      </ConsoleHeader>

      <EventList>
        {events.length === 0 && <EmptyItem>Aguardando eventos…</EmptyItem>}
        {[...events].reverse().map((e) => (
          <EventItem key={e.id}>
            <EventTs>{formatTime(e.ts)}</EventTs>
            <EventCategory $color={CATEGORY_COLOR[e.category] ?? '#94a3b8'}>
              {e.category}
            </EventCategory>
            <EventType>{e.type}</EventType>
            <EventPayload>{formatPayload(e.payload)}</EventPayload>
          </EventItem>
        ))}
      </EventList>
    </Wrap>
  );
}
