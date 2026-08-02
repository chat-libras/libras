import React from 'react';
import { Wrap, ContentPanel, BtnRail, RailBtn } from './styles.ts';

export interface SidebarItem {
  key: string;
  icon: string;
  title: string;
  /** null = botão toggle sem painel lateral (ex: debug que abre conteúdo em outro lugar) */
  content: React.ReactNode | null;
}

interface SidebarProps {
  items: SidebarItem[];
  activeKey: string | null;
  onToggle: (key: string) => void;
}

export function Sidebar({ items, activeKey, onToggle }: SidebarProps) {
  const activeItem =
    items.find((i) => i.key === activeKey && i.content !== null) ?? null;

  return (
    <Wrap>
      <ContentPanel $visible={!!activeItem}>{activeItem?.content}</ContentPanel>

      <BtnRail $isOpen={!!activeItem}>
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
