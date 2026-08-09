import { useState, Fragment, useCallback } from 'react';
import { useDebugEvents } from '../../debug/useDebugEvents/index.ts';
import { type DebugCategory } from '../../debug/event-bus/index.ts';
import {
  Wrap, Header, HeaderRow, Title, Filters, FilterBtn, ClearBtn, CopyBtn,
  List, Empty, EventRow, ColOrigin, ColRole, ColCategory, ColInfo, ColTs, DetailsRow,
  DateFilters, DateInput, DateLabel, Spinner,
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
  const { peerId, role, _peerId, _role, ...rest } = details;
  void peerId; void role; void _peerId; void _role;
  if (Object.keys(rest).length === 0) return null;
  return JSON.stringify(rest, null, 2);
}

export function DebugPanel() {
  const [activeFilters, setActiveFilters] = useState<DebugCategory[]>([...ALL_CATEGORIES]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');
  const { events, clear, loading } = useDebugEvents(activeFilters);
  const [copied, setCopied] = useState(false);

  const toggleFilter = (cat: DebugCategory) => {
    setActiveFilters((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const filteredByDate = events.filter((e) => {
    if (dateFrom && e.ts < new Date(dateFrom).getTime()) return false;
    if (dateTo   && e.ts > new Date(dateTo).getTime())   return false;
    return true;
  });

  const copyLogs = useCallback(() => {
    const text = filteredByDate.map((e) => {
      const ts = new Date(e.ts).toLocaleTimeString();
      const base = `[${ts}] [${e.origin}] [${e.role || '—'}] [${e.category}] ${e.info}`;
      const details = e.details ? `\n  ${JSON.stringify(e.details)}` : '';
      return base + details;
    }).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [filteredByDate]);

  return (
    <Wrap>
      <Header>
        <HeaderRow>
          <Title>🐛 Debug</Title>
          <DateFilters>
            <DateLabel>de</DateLabel>
            <DateInput type="datetime-local" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} title="Filtrar a partir de" />
            <DateLabel>até</DateLabel>
            <DateInput type="datetime-local" value={dateTo} onChange={(e) => setDateTo(e.target.value)} title="Filtrar até" />
            {(dateFrom || dateTo) && (
              <ClearBtn onClick={() => { setDateFrom(''); setDateTo(''); }} title="Limpar filtro de data">✕</ClearBtn>
            )}
          </DateFilters>
          <CopyBtn onClick={copyLogs} title="Copiar todos os logs">{copied ? '✅' : '📋'}</CopyBtn>
          <ClearBtn onClick={clear}>Limpar</ClearBtn>
        </HeaderRow>
        <HeaderRow>
          <Filters>
            {ALL_CATEGORIES.map((cat) => (
              <FilterBtn key={cat} $active={activeFilters.includes(cat)} $color={categoryColor(cat)} onClick={() => toggleFilter(cat)}>
                {cat}
              </FilterBtn>
            ))}
          </Filters>
        </HeaderRow>
      </Header>

      <List>
        {loading && <Spinner>Carregando eventos…</Spinner>}
        {!loading && filteredByDate.length === 0 && <Empty>Nenhum evento ainda…</Empty>}
        {!loading && filteredByDate.map((e) => {
          const details = formatDetails(e.details);
          return (
            <Fragment key={e.id}>
              <EventRow>
                <ColOrigin>{e.origin}</ColOrigin>
                <ColRole $color={roleColor(e.role)}>{e.role || '—'}</ColRole>
                <ColCategory $color={categoryColor(e.category)}>[{e.category}]</ColCategory>
                <ColInfo>{e.info}</ColInfo>
                <ColTs>{new Date(e.ts).toLocaleTimeString()}</ColTs>
              </EventRow>
              {details && (
                <DetailsRow>{details}</DetailsRow>
              )}
            </Fragment>
          );
        })}
      </List>
    </Wrap>
  );
}
