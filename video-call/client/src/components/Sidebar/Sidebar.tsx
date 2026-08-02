import styled from 'styled-components';

// ── Styled ────────────────────────────────────────────────────────────────────

/** Wrapper externo: botões fixos à direita, conteúdo expande para a esquerda */
const Wrap = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  flex-shrink: 0;
  align-items: stretch;
`;

/** Painel de conteúdo — expande para a esquerda dos botões */
const ContentPanel = styled.div<{ $visible: boolean }>`
  width: ${({ $visible }) => ($visible ? '320px' : '0')};
  overflow: hidden;
  transition: width 0.2s ease;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  /* filho (ChatPanel/DebugPanel) ocupa 100% */
  & > * { width: 320px; height: 100%; }
`;

/** Coluna de botões — sempre 48px, fixo à direita, fundo e borda do container */
const BtnRail = styled.div`
  display: flex;
  flex-direction: column;
  width: 48px;
  flex-shrink: 0;
  background: ${({ theme }) => theme.bg.secondary};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  overflow: hidden;
`;

const RailBtn = styled.button<{ $active?: boolean; $last?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: none;
  border-bottom: ${({ $last, theme }) => ($last ? 'none' : `1px solid ${theme.border}`)};
  border-radius: 0;
  background: ${({ $active, theme }) => ($active ? theme.btn.active.bg : 'transparent')};
  color: ${({ $active, theme }) => ($active ? theme.btn.active.text : theme.text.secondary)};
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;

  &:hover {
    background: ${({ $active, theme }) => ($active ? theme.btn.active.hover : theme.bg.tertiary)};
    color: ${({ theme }) => theme.text.primary};
  }

  .material-icons { font-size: 22px; user-select: none; }
`;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SidebarItem {
  key: string;
  icon: string;
  title: string;
  /** null = botão toggle sem painel (ex: debug que abre conteúdo em outro lugar) */
  content: React.ReactNode | null;
}

interface SidebarProps {
  items: SidebarItem[];
  activeKey: string | null;
  onToggle: (key: string) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Sidebar({ items, activeKey, onToggle }: SidebarProps) {
  // Só exibe painel para o item ativo que tenha content
  const activeItem = items.find((i) => i.key === activeKey && i.content !== null) ?? null;

  return (
    <Wrap>
      <ContentPanel $visible={!!activeItem}>
        {activeItem?.content}
      </ContentPanel>

      <BtnRail>
        {items.map((item, i) => (
          <RailBtn
            key={item.key}
            $active={activeKey === item.key}
            $last={i === items.length - 1}
            onClick={() => onToggle(item.key)}
            title={item.title}
          >
            <span className="material-icons">{item.icon}</span>
          </RailBtn>
        ))}
      </BtnRail>
    </Wrap>
  );
}
