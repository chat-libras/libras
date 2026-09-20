# libras-translator

Plugin React que embute o avatar de Libras **VLibras** (Unity/WebGL, gov.br) em qualquer aplicativo de videochamada. Um participante fala ou escreve; o participante surdo vê a mensagem sinalizada em tempo real pelo avatar oficial — sem ASR proprietário obrigatório, sem servidor próprio para o avatar.

> O VLibras é **LGPLv3**. Os sinais são oficiais e revisados pelo MECDAISY/Serpro.

## Quickstart

```bash
# ainda não publicado no npm — importe pelo caminho relativo
# npm install libras-translator  ← futuro
```

```tsx
import { LibrasChat, type LibrasChatMessage } from 'libras-translator';
import { useState } from 'react';

export function Chamada() {
  const [messages, setMessages] = useState<LibrasChatMessage[]>([]);

  const handleSend = (text: string) => {
    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), from: 'sender', text },
    ]);
  };

  return (
    <>
      
      <LibrasChat role="sender" messages={messages} onSend={handleSend} />
      <LibrasChat role="receiver" messages={messages} onSend={() => {}} />
    </>
  );
}
```

Em produção, cada `role` roda em máquinas separadas; ligue `messages`/`onSend` ao seu transporte (WebSocket, Firebase, Vonage `signal()`, etc.).

## Documentação por contexto

| Contexto | Documento |
|----------|-----------|
| Referência completa da API | [docs/api.md](docs/api.md) |
| Primeiro uso, instalação e demo | [docs/guides/getting-started.md](docs/guides/getting-started.md) |
| Configurar ASR (microfone, Deepgram, customizado) | [docs/guides/asr.md](docs/guides/asr.md) |
| Integrar com Vonage, Daily, Jitsi, WebRTC, Teams | [docs/guides/video-call-adapters.md](docs/guides/video-call-adapters.md) |
| Tematização, i18n, acessibilidade, controles | [docs/guides/customization.md](docs/guides/customization.md) |
| Arquitetura interna (mantenedores/IA) | [docs/architecture.md](docs/architecture.md) |
| Hospedar os assets do VLibras offline | [docs/vlibras-setup.md](docs/vlibras-setup.md) |
| Specs dos componentes | [docs/specs/chat-e-avatar.md](docs/specs/chat-e-avatar.md) |
| Specs dos adapters | [docs/specs/adapter-videochamada.md](docs/specs/adapter-videochamada.md) |

## Componentes e Hooks

| Export | O que faz | Quando usar |
|--------|-----------|-------------|
| `<LibrasChat>` | Chat assimétrico entre participantes com avatar + ASR | Produto principal; você gerencia o histórico e o transporte |
| `<LibrasChatPanel>` | Versão automanaged do chat (estado interno) | Integração rápida sem precisar de estado próprio |
| `<LibrasTranslator>` | Avatar + ASR com controles embutidos | Sinalizar áudio remoto sem o chat |
| `useLibrasTranslator` | Hook base de `<LibrasTranslator>` | UI totalmente customizada com ASR |
| `useLibrasAvatar` | Só o avatar, sem ASR | Participante surdo (role='receiver'); você passa o texto |
| `<LibrasProvider>` | Configuração global (opt-in) | Definir defaults de VLibras/ASR/strings para toda a árvore |
| Adapters | Extraem `MediaStream` de SDKs de vídeo | Integrar com Vonage, Daily, Jitsi, WebRTC puro |

## Projetos executáveis

| Projeto | Pasta | Porta | Para que | Como rodar |
|---------|-------|-------|----------|------------|
| **Demo** | `/` (raiz) | 5173 | Testar a lib em memória, sem backend | `npm run dev` |
| **Video-call** | `examples/video-call/` | 5174 + 3001 | WebRTC real com server + DB SQLite | `yarn vc` (na raiz) |

Ver instruções detalhadas em [docs/guides/getting-started.md](docs/guides/getting-started.md).

## Limitações

- **Latência de ASR**: 1–4 s inerentes ao reconhecimento de fala (a frase precisa ser dita antes de ser traduzida).
- **Custo de ASR em chamadas**: a Web Speech API é gratuita mas só ouve o microfone local; o áudio remoto de uma chamada exige ASR de nuvem (ex.: Deepgram, AssemblyAI, Azure, etc.).
- **Navegador apenas**: a captura de áudio de chamada depende de `MediaStream` na Web. Apps nativos (Meet, Zoom, Teams nativos) não expõem esse stream — o padrão sem custo é cada lado transcrever a própria fala localmente e enviar só o texto.
- **VLibras é LGPLv3**: os assets do avatar não podem ser relicenciados. O player é um singleton por página (não instancie dois avatares simultaneamente).
