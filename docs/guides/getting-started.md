# Primeiro uso

## Requisitos

| Requisito | Versão mínima | Observação |
|-----------|---------------|------------|
| Node.js | 18 LTS | Server do video-call exige ≥22 (better-sqlite3@13) |
| React | 18 | |
| Navegador | Chrome ou Edge | Web Speech API para microfone; WebRTC para chamadas |
| Yarn | qualquer | Necessário para o projeto video-call |

## 1. Clonar e instalar

```bash
git clone <url-do-repositorio>
cd libras

# instalar dependências de todos os workspaces
yarn install
# ou somente a lib + demo:
cd packages/libras-kit && npm install
```

## 2. Rodar a demo (forma mais rápida de ver funcionando)

```bash
cd packages/libras-kit
npm run dev
# → http://localhost:5173
```

Abra no **Chrome**. A demo mostra os diferentes modos de uso do avatar — microfone, texto digitado, configurações de velocidade.

> O avatar leva alguns segundos para carregar na primeira vez (WASM ~13 MB via CDN).

## 3. Rodar o projeto de videochamada real

O projeto `examples/video-call/` é uma chamada WebRTC mesh completa com backend Express + SQLite.

**Requisito adicional:** Node.js ≥ 22 e Yarn.

```bash
# instalar dependências dos dois lados
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

## 4. Adicionar ao seu próprio app

O pacote ainda não está publicado no npm. Copie a pasta `packages/libras-kit/src/libras/` para o seu projeto e importe pelo caminho relativo. Quando publicado, será `import ... from 'libras-kit'`.

### Exemplo mínimo — avatar sinaliza o microfone

```tsx
import { LibrasAvatar } from 'libras-kit';

// microfone local → avatar sinaliza automaticamente
export function PaginaLibras() {
  return <LibrasAvatar />;
}
```

### Exemplo com chat visível

```tsx
import { LibrasAvatar } from 'libras-kit';

export function PaginaComChat() {
  return (
    <LibrasAvatar
      showChat
      classNames={{
        root: 'widget',
        avatar: 'avatar-stage',
        chat: 'chat-panel',
        message: 'chat-bubble',
      }}
      onSend={(text) => ws.send(text)}
      onTranscript={(text) => console.log('Transcrito:', text)}
    />
  );
}
```

### Exemplo com hook (UI totalmente customizada)

```tsx
import { useLibrasAvatar } from 'libras-kit';

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

### Servir os assets do VLibras

O player Unity precisa dos arquivos em `public/vlibras/`. Copie a pasta `packages/libras-kit/public/vlibras/` para o `public/` do seu projeto (Vite, CRA, Next.js public assets).

Para hospedar em CDN próprio ou usar offline, veja [docs/vlibras-setup.md](../vlibras-setup.md).

## 5. Próximos passos

| Tópico | Guia |
|--------|------|
| Configurar ASR (customizado, fallback) | [docs/guides/asr.md](asr.md) |
| Integrar com Vonage, Daily, Jitsi, WebRTC puro | [docs/guides/video-call-adapters.md](video-call-adapters.md) |
| Tematização, i18n, acessibilidade | [docs/guides/customization.md](customization.md) |
| Referência completa de props e tipos | [docs/api.md](../api.md) |
| Hospedar assets VLibras offline | [docs/vlibras-setup.md](../vlibras-setup.md) |
