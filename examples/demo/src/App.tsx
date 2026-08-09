import { useState } from 'react';
import { Spec1Avatar } from './demos/Spec1Avatar';
import { Spec2Chat } from './demos/Spec2Chat';
import { Spec3ChatPanel } from './demos/Spec3ChatPanel';
import { Spec4Provider } from './demos/Spec4Provider';
import './styles.css';

type Tab = 'spec1' | 'spec2' | 'spec3' | 'spec4';

const TABS: { id: Tab; label: string; title: string; desc: string }[] = [
  {
    id: 'spec1',
    label: 'Spec 1 — Avatar livre',
    title: 'Avatar com posição livre',
    desc: 'useLibrasTranslator retorna containerRef — attachable em qualquer div. Posicionamento 100% CSS. Texto manual ou microfone.',
  },
  {
    id: 'spec2',
    label: 'Spec 2 — Chat controlado',
    title: 'Chat assimétrico controlado',
    desc: '<LibrasChat> é controlado: o pai gerencia messages[] e liga onSend ao transporte. Útil para persistência e timestamps customizados.',
  },
  {
    id: 'spec3',
    label: 'Spec 3 — Chat drop-in',
    title: 'Chat drop-in autogerenciado',
    desc: '<LibrasChatPanel> gerencia messages[] internamente. Basta passar role e ligar incomingMessage/onMessage ao transporte.',
  },
  {
    id: 'spec4',
    label: 'Spec 4 — Provider global',
    title: 'Configuração global com LibrasProvider',
    desc: '<LibrasProvider config={…}> define defaults para todos os componentes filhos. Props locais sobrescrevem o provider.',
  },
];

export function App() {
  const [active, setActive] = useState<Tab>('spec1');
  const tab = TABS.find((t) => t.id === active)!;

  return (
    <div className="demo">
      <header className="demo__header">
        <h1>libras-translator — Spec: Chat e Avatar</h1>
        <p>Harness de teste das 4 formas de uso do plugin.</p>
      </header>

      <nav className="demo__tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`demo__tab ${active === t.id ? 'demo__tab--active' : ''}`}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="demo__spec-header">
        <h2>{tab.title}</h2>
        <p>{tab.desc}</p>
      </div>

      <main className="demo__content">
        {active === 'spec1' && <Spec1Avatar />}
        {active === 'spec2' && <Spec2Chat />}
        {active === 'spec3' && <Spec3ChatPanel />}
        {active === 'spec4' && <Spec4Provider />}
      </main>
    </div>
  );
}
