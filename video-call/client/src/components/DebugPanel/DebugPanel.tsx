import { useState } from 'react';
import styled from 'styled-components';
import { useDebugEvents } from '../../debug/useDebugEvents.ts';
import { type DebugCategory } from '../../debug/event-bus.ts';

const CATEGORY_COLORS: Record<DebugCategory, string> = {
  audio:  '#4ade80',
  libras: '#60a5fa',
  socket: '#f59e0b',
  focus:  '#a78bfa',
  media:  '#f472b6',
  ui:     '#34d399',
};

const ALL_CATEGORIES: DebugCategory[] = ['audio', 'libras', 'socket', 'focus', 'media', 'ui'];

// ── Styled ────────────────────────────────────────────────────────────────────

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  overflow: hidden;
  font-family: monospace;
  font-size: 11px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.bg.secondary};
  flex-shrink: 0;
  min-height: 42px;
`;

const Title = styled.span`
  font-weight: bold;
  color: ${({ theme }) => theme.text.primary};
  flex: 1;
  font-family: inherit;
`;

const Filters = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`;

const FilterBtn = styled.button<{ $active: boolean; $color: string }>`
  padding: 2px 6px;
  border: 1px solid ${({ $color }) => $color};
  border-radius: 4px;
  background: ${({ $active, $color }) =>
    $active ? `color-mix(in srgb, ${$color} 20%, transparent)` : 'transparent'};
  color: ${({ $active, $color }) => ($active ? $color : '#6b7280')};
  cursor: pointer;
  font-size: 10px;
  font-family: monospace;
  transition: all 0.15s;
`;

const ClearBtn = styled.button`
  padding: 2px 8px;
  background: ${({ theme }) => theme.bg.tertiary};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  color: ${({ theme }) => theme.text.secondary};
  cursor: pointer;
  font-size: 10px;
  font-family: monospace;
  flex-shrink: 0;
  &:hover { background: ${({ theme }) => theme.border}; }
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  flex: 1;
`;

const Empty = styled.li`
  padding: 16px;
  color: ${({ theme }) => theme.text.muted};
  text-align: center;
`;

const EventRow = styled.li`
  display: grid;
  grid-template-columns: 64px 1fr 68px;
  gap: 4px;
  padding: 3px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.bg.tertiary};
  align-items: baseline;
  white-space: nowrap;
`;

const Cat = styled.span<{ $color: string }>`
  font-weight: bold;
  color: ${({ $color }) => $color};
`;

const EvType = styled.span`
  color: ${({ theme }) => theme.text.primary};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Ts = styled.span`
  color: ${({ theme }) => theme.text.muted};
  text-align: right;
`;

// ── Component ─────────────────────────────────────────────────────────────────

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
            <FilterBtn key={cat} $active={activeFilters.includes(cat)} $color={CATEGORY_COLORS[cat]} onClick={() => toggleFilter(cat)}>
              {cat}
            </FilterBtn>
          ))}
        </Filters>
        <ClearBtn onClick={clear}>Limpar</ClearBtn>
      </Header>

      <List>
        {events.length === 0 && <Empty>Nenhum evento ainda…</Empty>}
        {events.map((e) => (
          <EventRow key={e.id}>
            <Cat $color={CATEGORY_COLORS[e.category]}>[{e.category}]</Cat>
            <EvType>{e.type}</EvType>
            <Ts>{new Date(e.ts).toLocaleTimeString()}</Ts>
          </EventRow>
        ))}
      </List>
    </Wrap>
  );
}
