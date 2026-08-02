import type { DebugConsoleEvent } from '../../hooks/useDebugConsole.ts';
import './DebugConsole.css';

const CATEGORY_COLOR: Record<string, string> = {
  media: '#f472b6',
  ui: '#34d399',
  audio: '#4ade80',
  libras: '#60a5fa',
  socket: '#f59e0b',
  focus: '#a78bfa',
  vad: '#fb923c',
  stt: '#38bdf8',
  glosa: '#c084fc',
  system: '#94a3b8',
};

function formatPayload(payload: Record<string, unknown>): string {
  const { _peerId, _role, ...rest } = payload;
  const parts: string[] = [];
  if (_role) parts.push(`[${String(_role)}]`);
  Object.entries(rest).forEach(([k, v]) => {
    parts.push(`${k}=${typeof v === 'object' ? JSON.stringify(v) : String(v)}`);
  });
  return parts.join(' ');
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });
}

interface DebugConsoleProps {
  events: DebugConsoleEvent[];
  onClear: () => void;
}

export function DebugConsole({ events, onClear }: DebugConsoleProps) {
  return (
    <div className="debug-console">
      <div className="debug-console__header">
        <span className="debug-console__title">🔬 Debug Console</span>
        <span className="debug-console__count">{events.length} eventos</span>
        <button className="debug-console__clear" onClick={onClear}>Limpar</button>
      </div>
      <ul className="debug-console__list">
        {events.length === 0 && (
          <li className="debug-console__empty">Aguardando eventos…</li>
        )}
        {[...events].reverse().map((e) => (
          <li key={e.id} className="debug-console__event">
            <span className="debug-console__ts">{formatTime(e.ts)}</span>
            <span
              className="debug-console__category"
              style={{ color: CATEGORY_COLOR[e.category] ?? '#94a3b8' }}
            >
              {e.category}
            </span>
            <span className="debug-console__type">{e.type}</span>
            <span className="debug-console__payload">{formatPayload(e.payload)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
