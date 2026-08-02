import { useState } from 'react';
import { useDebugEvents } from '../../debug/useDebugEvents.ts';
import { type DebugCategory } from '../../debug/event-bus.ts';
import {
  Wrap, Header, Title, Filters, FilterBtn, ClearBtn,
  List, Empty, EventRow, ColOrigin, ColRole, ColCategory, ColInfo, ColTs, DetailsRow,
} from './styles.ts';

const CATEGORY_COLORS: Record<string, string> = {
  audio:   '#4ade80',
  libras:  '#60a5fa',
  socket:  '#f59e0b',
  focus:   '#a78bfa',
  media:   '#f472b6',
  ui:      '#34d399',
  system:  '#94a3b8',
  vad:     '#fb923c',
  stt:     '#38bdf8',
  glosa:   '#c084fc',
};

const ROLE_COLORS: Record<string, string> = {
  patient:      '#60a5fa',
  professional: '#34d399',
  server:       '#f59e0b',
};

const ALL_CATEGORIES: DebugCategory[] = [
  'audio', 'libras', 'socket', 'focus', 'media', 'ui', 'system', 'vad', 'stt', 'glosa',
];

function categoryColor(cat: string): string {
  return CATEGORY_COLORS[cat] ?? '#94a3b8';
}

function roleColor(role: string): string {
  return ROLE_COLORS[role] ?? '#94a3b8';
}

function formatDetails(details: Record<string, unknown> | null): string | null {
  if (!details) return null;
  // remove campos redundantes já exibidos nas colunas
  const { peerId, role, _peerId, _role, ...rest } = details;
  void peerId; void role; void _peerId; void _role;
  if (Object.keys(rest).length === 0) return null;
  return JSON.stringify(rest, null, 2);
}

export function DebugPanel() {
  const [activeFilters, setActiveFilters] = useState<DebugCategory[]>([...ALL_CATEGORIES]);
  const { events, clear } = useDebugEvents(activeFilters);

  const toggleFilter = (cat: DebugCategory) => {
    setActiveFilters((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  return (
    <Wrap>
      <Header>
        <Title>🐛 Debug</Title>
        <Filters>
          {ALL_CATEGORIES.map((cat) => (
            <FilterBtn
              key={cat}
              $active={activeFilters.includes(cat)}
              $color={categoryColor(cat)}
              onClick={() => toggleFilter(cat)}
            >
              {cat}
            </FilterBtn>
          ))}
        </Filters>
        <ClearBtn onClick={clear}>Limpar</ClearBtn>
      </Header>

      <List>
        {events.length === 0 && <Empty>Nenhum evento ainda…</Empty>}
        {events.map((e) => {
          const details = formatDetails(e.details);
          return (
            <>
              <EventRow key={e.id}>
                <ColOrigin>{e.origin}</ColOrigin>
                <ColRole $color={roleColor(e.role)}>{e.role || '—'}</ColRole>
                <ColCategory $color={categoryColor(e.category)}>[{e.category}]</ColCategory>
                <ColInfo>{e.info}</ColInfo>
                <ColTs>{new Date(e.ts).toLocaleTimeString()}</ColTs>
              </EventRow>
              {details && (
                <DetailsRow key={`${e.id}-details`}>{details}</DetailsRow>
              )}
            </>
          );
        })}
      </List>
    </Wrap>
  );
}
