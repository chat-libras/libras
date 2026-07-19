# libras-translator

Biblioteca **React** para embutir um **chat de teleconsulta acessível** em qualquer app de
**videochamada** (Vonage, Twilio, WebRTC, etc.). O médico **fala ou escreve**; o cliente surdo
**vê a mensagem sinalizada em Libras** pelo avatar oficial do **VLibras** (Ícaro) e responde por
texto — com **fila sincronizada** (frases não se atropelam).

> ⚠️ O VLibras é **LGPLv3** e roda em Unity/WebGL. Os sinais são oficiais e revisados.

> 📖 **Novo por aqui?** Comece pelo **[Guia passo a passo](docs/GUIA.md)** — do zero à
> produção, com integrações (Vonage, WebRTC, Teams). Para o design por dentro, veja a
> **[documentação de arquitetura](docs/ARQUITETURA.md)**.

## O produto: `<LibrasChat>`

Um chat **assimétrico** e **agnóstico de transporte**. A mesma peça serve os dois lados (em
máquinas diferentes); você liga `messages`/`onSend` ao seu canal real.

```
Médico (ouvinte)  ── fala (áudio→texto) ou escreve ──►  Cliente vê em LIBRAS (avatar VLibras)
Cliente (surdo)   ── escreve ─────────────────────────►  Médico lê em TEXTO
```

```tsx
import { LibrasChat, type LibrasChatMessage } from './libras';

function Consulta() {
  const [messages, setMessages] = useState<LibrasChatMessage[]>([]);
  const onSend = (from) => (text) =>
    setMessages((m) => [...m, { id: crypto.randomUUID(), from, text }]);

  // Cada lado roda numa máquina; ligue onSend/messages ao seu transporte
  // (Vonage session.signal(), WebSocket, Firebase…). Aqui, um exemplo local:
  return (
    <>
      <LibrasChat role="doctor" messages={messages} onSend={onSend('doctor')} />
      <LibrasChat role="client" messages={messages} onSend={onSend('client')} />
    </>
  );
}
```

### Áudio do médico é plugável

Por padrão o lado do médico usa a **Web Speech API** (grátis, Chrome/Edge, pt-BR). Para
transcrever o **áudio da chamada** (ou usar um provedor de nuvem), passe `audio`/`asr`:

```tsx
// Áudio remoto do WebRTC → texto via Deepgram (nuvem):
<LibrasChat
  role="doctor"
  messages={messages}
  onSend={onSend('doctor')}
  audio={{ kind: 'stream', stream: remoteAudioStream }}
  asr={{ provider: 'deepgram', apiKey: import.meta.env.VITE_DEEPGRAM_KEY }}
/>
```

**Por que dois ASR?** A Web Speech API (grátis) só ouve o **microfone**. O áudio de uma chamada
(MediaStream do WebRTC) precisa de um **ASR de nuvem**.

### Props de `<LibrasChat>`

| Prop | Tipo | Descrição |
|------|------|-----------|
| `role` | `'doctor' \| 'client'` | Qual lado esta instância representa |
| `messages` | `LibrasChatMessage[]` | Histórico completo (controlado pelo app) |
| `onSend` | `(text) => void` | Envio deste lado — ligue ao seu transporte |
| `audio` | `{kind:'microphone'}` \| `{kind:'stream',stream}` | (médico) fonte do áudio. Default: microfone |
| `asr` | `{provider:'webspeech',lang?}` \| `{provider:'deepgram',apiKey,lang?}` | (médico) motor de ASR. Default: webspeech pt-BR |
| `vlibras` | `{bundleUrl?, targetPath?, avatar?}` | (cliente) onde estão os assets do VLibras |
| `speed` | `number` | Velocidade da sinalização (default `1.3`) |
| `labels` | `Partial<Record<role,string>>` | Rótulos das bolhas (default Médico/Cliente) |

## Uso avançado — primitivos

O chat é montado sobre peças reutilizáveis, também exportadas:

- **`useLibrasAvatar(options)`** → só o avatar: `translate(text)` sinaliza um texto pronto
  (sem ASR). É o que o lado cliente usa.
- **`useLibrasTranslator(options)`** / **`<LibrasTranslator />`** → avatar + captura de áudio
  (microfone ou stream) com ASR embutido. Útil para "traduzir a fala remota" sem o chat.

```tsx
import { LibrasTranslator } from './libras';

// Traduzir a fala remota de uma chamada (paciente surdo vê o médico em Libras):
<LibrasTranslator
  audio={{ kind: 'stream', stream: remoteAudioStream }}
  asr={{ provider: 'deepgram', apiKey: import.meta.env.VITE_DEEPGRAM_KEY }}
  showCaptions
/>
```

`<LibrasTranslator>` traz **controles embutidos** (start/parar, velocidade 1×–2×, campo de
texto) ligados por padrão — `controls={false}` esconde, ou `controls={{ start, speed, text }}`.

`useLibrasTranslator(options)` → `{ containerRef, status, error, interim, listening, start, stop, translate, speed, setSpeed }`.

| Opção | Tipo | Descrição |
|-------|------|-----------|
| `audio` | `{kind:'microphone'}` \| `{kind:'stream', stream}` | Fonte do áudio |
| `asr` | `{provider:'webspeech',lang?}` \| `{provider:'deepgram',apiKey,lang?}` | Motor de ASR |
| `vlibras` | `{bundleUrl?, targetPath?, avatar?}` | Onde estão os assets do VLibras |
| `autoStart` | `boolean` | Ouvir ao carregar (default `true`) |
| `onTranscript` | `(text)=>void` | Cada frase final reconhecida |

`status`: `'loading' | 'ready' | 'listening' | 'error'`.

## Integração com plataformas de vídeo (adapters)

O plugin só precisa de **um `MediaStream` de áudio** (para traduzir a fala) ou de **texto**
(para sinalizar). Os *adapters* em `src/libras/adapters/` produzem essas entradas a partir de
plataformas reais — **sem tocar no core**.

### Vonage Video API

```tsx
import { audioStreamFromVonageSubscriberAsync, LibrasChat } from './libras';

session.on('streamCreated', async (e) => {
  const subscriber = session.subscribe(e.stream, targetEl, opts);
  const stream = await audioStreamFromVonageSubscriberAsync(subscriber); // faixa de áudio
  // <LibrasChat role="doctor" audio={{kind:'stream', stream}}
  //             asr={{provider:'deepgram', apiKey}} .../>
});
```

**Dica sem custo de ASR:** cada participante transcreve a própria fala **localmente** (Web
Speech, grátis) e envia só o **texto** via `session.signal()` — o outro lado sinaliza/lê. É
exatamente o modelo do `<LibrasChat>`. Helpers genéricos de WebRTC (Twilio, Agora, PeerConnection):
`audioStreamFromVideoElement(el)`, `audioStreamFromTrack(track)`, `audioStreamFromPeerConnection(pc)`.


## Rodar a demo

```bash
npm install
npm run dev      # http://localhost:5173  (use o Chrome p/ o microfone)
```

A demo simula uma **videochamada** com os dois lados numa tela só: ative a câmera do médico,
clique **🎤 Falar** (ou escreva) → o avatar do lado cliente sinaliza em Libras; responda como
cliente por texto → aparece no chat do médico. O canal entre os lados é em memória (imita o
`session.signal()` real). Código em `src/demo/App.tsx`.

## Assets do VLibras

O plugin carrega o player (`window.VLibras.Player`) + assets Unity de `targetPath`
(default `/vlibras/`). Já vêm em `public/vlibras/` para a demo. Para hospedar no seu projeto,
veja **[docs/vlibras-setup.md](docs/vlibras-setup.md)**.

## Scripts

| Comando | O quê |
|---------|-------|
| `npm run dev` | demo em modo dev |
| `npm run build` | build (typecheck + bundle) |
| `npm test` | testes da fila sincronizada + legendas (Vitest) |
| `npm run typecheck` | checagem de tipos |

## Arquitetura (separação de responsabilidades)

```
src/libras/                 # a biblioteca (publicável)
  core/
    sign-renderer.ts        # interface comum (DIP)
    vlibras-renderer.ts     # fila sincronizada (testada)
    vlibras-loader.ts       # carregador singleton do player
    asr/
      phrase-source.ts      # unifica fonte de áudio + ASR → frases
      webspeech.ts          # Web Speech API (microfone)
      cloud-asr.ts          # Deepgram (stream) — plugável
  react/
    useLibrasAvatar.ts      # só o avatar (sinaliza texto) — base
    useLibrasTranslator.ts  # avatar + ASR (compõe o de cima)
    LibrasTranslator.tsx    # componente pronto (avatar + controles)
    LibrasChat.tsx          # chat assimétrico médico↔cliente (o produto)
  adapters/                 # Vonage · WebRTC · legendas → produzem stream/texto
  index.ts                  # API pública
src/demo/                   # demo única: videochamada + chat
```

## Limitações

- Latência de ~1–4s (o ASR precisa ouvir a frase antes de traduzir — inerente).
- Áudio de chamada exige ASR de nuvem (custo/API key); microfone é grátis.
- Só áudio no navegador (Meet/Zoom web, `<video>`); apps nativos não são capturáveis.
