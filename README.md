# libras-kit

Plugin React que embute o avatar de Libras **VLibras** (Unity/WebGL, gov.br) em qualquer aplicativo. Um participante fala ou escreve; o participante surdo vê a mensagem sinalizada em tempo real pelo avatar oficial — sem ASR proprietário obrigatório, sem servidor próprio para o avatar.

> O VLibras é **LGPLv3**. Os sinais são oficiais e revisados pelo MECDAISY/Serpro.

## Quickstart

```bash
# ainda não publicado no npm — importe pelo caminho relativo
# npm install libras-kit  ← futuro
```

```tsx
import { LibrasAvatar } from 'libras-kit';

// microfone local → avatar sinaliza automaticamente
export function PaginaLibras() {
  return <LibrasAvatar />;
}
```

```tsx
// com chat visível e estilo próprio
import { LibrasAvatar } from 'libras-kit';

export function PaginaLibrasComChat() {
  return (
    <LibrasAvatar
      showChat
      classNames={{ root: 'widget', avatar: 'avatar-box', chat: 'chat-box' }}
      onSend={(text) => ws.send(text)}
    />
  );
}
```

## Documentação por contexto

| Contexto | Documento |
|----------|-----------|
| Referência completa da API | [docs/api.md](docs/api.md) |
| Primeiro uso, instalação e demo | [docs/guides/getting-started.md](docs/guides/getting-started.md) |
| Configurar ASR (microfone, customizado, fallback) | [docs/guides/asr.md](docs/guides/asr.md) |
| Integrar com Vonage, Daily, Jitsi, WebRTC, Teams | [docs/guides/video-call-adapters.md](docs/guides/video-call-adapters.md) |
| Tematização, i18n, acessibilidade | [docs/guides/customization.md](docs/guides/customization.md) |
| Arquitetura interna (mantenedores/IA) | [docs/architecture.md](docs/architecture.md) |
| Hospedar os assets do VLibras offline | [docs/vlibras-setup.md](docs/vlibras-setup.md) |

## Componentes e Hooks

| Export | O que faz | Quando usar |
|--------|-----------|-------------|
| `<LibrasAvatar>` | Avatar headless: microfone → Libras; chat opcional via `showChat` | Componente principal para qualquer caso de uso |
| `useLibrasTranslator` | Hook com avatar + ASR (base do componente) | UI totalmente customizada |
| `useLibrasAvatar` | Só o avatar, sem ASR | Sinalizar texto de outra fonte (legenda, WebSocket) |
| `<LibrasProvider>` | Configuração global opt-in | Defaults de VLibras/ASR/strings para toda a árvore |
| Adapters | Extraem `MediaStream` de SDKs de vídeo | Integrar com Vonage, Daily, Jitsi, WebRTC puro |

## Projetos executáveis

| Projeto | Pasta | Porta | Para que | Como rodar |
|---------|-------|-------|----------|------------|
| **Demo** | `packages/libras-kit/` | 5173 | Testar a lib, sem backend | `cd packages/libras-kit && npm run dev` |
| **Video-call** | `examples/video-call/` | 5174 + 3001 | WebRTC real com server + DB SQLite | `yarn vc` (na raiz) |

Ver instruções detalhadas em [docs/guides/getting-started.md](docs/guides/getting-started.md).

## Limitações

- **Latência de ASR**: 1–4 s inerentes ao reconhecimento de fala (a frase precisa ser dita antes de ser traduzida).
- **Custo de ASR em chamadas**: a Web Speech API é gratuita mas só ouve o microfone local; o áudio remoto de uma chamada exige ASR de nuvem (ex.: Deepgram, AssemblyAI, Azure, etc.).
- **Navegador apenas**: a captura de áudio de chamada depende de `MediaStream` na Web. Apps nativos (Meet, Zoom, Teams nativos) não expõem esse stream — o padrão sem custo é cada lado transcrever a própria fala localmente e enviar só o texto.
- **VLibras é LGPLv3**: os assets do avatar não podem ser relicenciados. O player é um singleton por página (não instancie dois avatares simultaneamente).
