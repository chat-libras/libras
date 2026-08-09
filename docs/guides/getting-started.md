# Primeiro uso

## Requisitos

| Requisito | Versao minima | Observacao |
|-----------|---------------|------------|
| Node.js | 18 LTS | Server do video-call exige ≥22 (better-sqlite3@13) |
| React | 18 | |
| Navegador | Chrome ou Edge | Web Speech API para microfone; WebRTC para chamadas |
| Yarn | qualquer | Apenas para o projeto video-call |

## 1. Clonar e instalar

```bash
git clone <url-do-repositorio>
cd libras

# dependencias da lib e da demo
npm install
```

## 2. Rodar a demo (forma mais rapida de ver funcionando)

```bash
npm run dev
# → http://localhost:5173
```

Abra no **Chrome**. A demo simula uma videochamada com dois participantes — um que fala e outro que vê em Libras — na mesma tela, ligados por um canal em memoria — sem backend.

O que testar:

1. Clique em **Falar** no painel do orador → fale em pt-BR → o avatar sinaliza no painel do participante surdo.
2. Ou escreva uma mensagem no campo de texto do chat do orador → mesmo efeito.
3. Responda pelo painel do participante surdo → aparece no historico da outra parte.

> O avatar leva alguns segundos para carregar na primeira vez (WASM ~13 MB via CDN).

## 3. Rodar o projeto de videochamada real

O projeto `examples/video-call/` e uma chamada WebRTC mesh completa com backend Express + SQLite.

**Requisito adicional:** Node.js ≥ 22 e Yarn.

```bash
# instalar dependencias dos dois lados
cd examples/video-call/server && yarn install
cd ../client && yarn install
cd ../../..

# rodar server + client em paralelo
yarn vc
# server → http://localhost:3001
# client → http://localhost:5174
```

Ou em dois terminais separados:

```bash
# Terminal 1 — server
cd examples/video-call/server
cp .env.example .env   # apenas na primeira vez
yarn dev

# Terminal 2 — client
cd examples/video-call/client
cp .env.example .env   # apenas na primeira vez
yarn dev
```

O que testar:

1. Acesse `http://localhost:5174` → crie uma sessao.
2. Copie os links dos participantes.
3. Abra cada link em uma aba (ou maquina) separada.
4. Clique em **Libras** → o avatar carrega.
5. Fale no painel do orador → o avatar sinaliza no painel do participante surdo.

## 4. Adicionar ao seu proprio app

O pacote ainda nao esta publicado no npm. Copie a pasta `src/libras/` para o seu projeto e importe pelo caminho relativo. Quando publicado, sera `import ... from 'libras-translator'`.

### Exemplo minimo — avatar sinaliza texto

```tsx
import { useLibrasAvatar } from 'libras-translator';

function Avatar({ texto }: { texto: string }) {
  const { containerRef, status, translate } = useLibrasAvatar({ speed: 1.2 });

  useEffect(() => {
    if (texto) translate(texto);
  }, [texto]);

  return (
    <div style={{ width: 320, height: 240, position: 'relative' }}>
      {status === 'loading' && <p>Carregando avatar...</p>}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
```

### Exemplo com microfone (Web Speech, gratis)

```tsx
import { LibrasTranslator } from 'libras-translator';

function PaginaLibras() {
  return (
    <LibrasTranslator
      audio={{ kind: 'microphone' }}
      showCaptions
      speed={1.3}
    />
  );
}
```

### Exemplo com chat completo

```tsx
import { LibrasChat, type LibrasChatMessage } from 'libras-translator';
import { useState } from 'react';

function Chamada() {
  const [messages, setMessages] = useState<LibrasChatMessage[]>([]);

  const handleSend = (from: 'sender' | 'receiver') => (text: string) => {
    setMessages((m) => [...m, { id: crypto.randomUUID(), from, text }]);
    // em producao: envie tambem via WebSocket/Firebase/Vonage signal()
  };

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {/* roda no dispositivo de quem fala */}
      <LibrasChat
        role="sender"
        messages={messages}
        onSend={handleSend('sender')}
      />
      {/* roda no dispositivo de quem ve em Libras */}
      <LibrasChat
        role="receiver"
        messages={messages}
        onSend={handleSend('receiver')}
      />
    </div>
  );
}
```

Em producao, cada `<LibrasChat>` roda em uma maquina diferente. O `messages` de um lado chega via transporte (WebSocket, Firebase, etc.) para o outro.

### Servir os assets do VLibras

O player Unity precisa dos arquivos em `public/vlibras/`. Copie a pasta `public/vlibras/` do repositorio para o `public/` do seu projeto (Vite, CRA, Next.js public assets).

Para hospedar em CDN proprio ou usar offline, veja [docs/vlibras-setup.md](../vlibras-setup.md).

## 5. Proximos passos

| Topico | Guia |
|--------|------|
| Configurar ASR (Deepgram, customizado, fallback) | [docs/guides/asr.md](asr.md) |
| Integrar com Vonage, Daily, Jitsi, WebRTC puro | [docs/guides/video-call-adapters.md](video-call-adapters.md) |
| Tematizacao, i18n, acessibilidade | [docs/guides/customization.md](customization.md) |
| Referencia completa de props e tipos | [docs/api.md](../api.md) |
| Hospedar assets VLibras offline | [docs/vlibras-setup.md](../vlibras-setup.md) |
