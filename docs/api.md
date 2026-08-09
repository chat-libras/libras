# Referencia da API — libras-translator

Todos os exports publicos vem de `'libras-translator'` (ou do caminho relativo `'./libras'` enquanto o pacote nao for publicado).

---

## `<LibrasProvider>`

Configura defaults globais para toda a arvore React. Totalmente opt-in — nenhum componente exige o provider.

```tsx
import { LibrasProvider } from 'libras-translator';

<LibrasProvider
  config={{
    vlibras: { avatar: 'hozana', translatorUrl: '/vlibras-translate' },
    asr: { provider: 'webspeech', lang: 'pt-BR' },
    strings: { buttonTranslate: 'Iniciar' },
    a11y: { avatarLabel: 'Interprete de Libras', respectReducedMotion: true },
  }}
>
  <App />
</LibrasProvider>
```

### `LibrasConfig`

```ts
interface LibrasConfig {
  vlibras?: VLibrasLoaderOptions;
  asr?: ASROptions;
  audio?: AudioSource;
  strings?: LibrasStrings;
  a11y?: A11yOptions;
}
```

Props passadas diretamente aos componentes sempre sobreescrevem o provider.

---

## Hooks

### `useLibrasAvatar`

Hook base. Gerencia o avatar sem ASR. Usado pelo lado do participante surdo.

```ts
function useLibrasAvatar(options?: UseLibrasAvatarOptions): LibrasAvatarApi
```

#### `UseLibrasAvatarOptions`

```ts
interface UseLibrasAvatarOptions {
  vlibras?: VLibrasLoaderOptions;
  speed?: number;       // default: 1
  onReady?: () => void;
}
```

#### `LibrasAvatarApi`

```ts
interface LibrasAvatarApi {
  containerRef: React.RefCallback<HTMLDivElement>; // aplique em qualquer <div>
  status: 'loading' | 'ready' | 'error';
  error: string | null;
  translate: (text: string) => void;  // sinaliza texto (com fila; sem sobreposicao)
  speed: number;
  setSpeed: (speed: number) => void;
  renderer: SignRenderer | null;       // uso avancado (LibrasObserver)
}
```

#### Exemplo

```tsx
import { useLibrasAvatar } from 'libras-translator';

function AvatarCliente({ textoDoMedico }: { textoDoMedico: string }) {
  const { containerRef, status, translate } = useLibrasAvatar({ speed: 1.3 });

  useEffect(() => {
    if (textoDoMedico) translate(textoDoMedico);
  }, [textoDoMedico]);

  return (
    <div style={{ width: 320, height: 240 }}>
      {status === 'loading' && <p>Carregando avatar...</p>}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
```

---

### `useLibrasTranslator`

Compoe `useLibrasAvatar` com captura de audio e ASR.

```ts
function useLibrasTranslator(options: UseLibrasTranslatorOptions): LibrasTranslatorApi
```

#### `UseLibrasTranslatorOptions`

```ts
interface UseLibrasTranslatorOptions {
  audio: AudioSource;
  asr?: ASROptions;          // default: webspeech (para microphone)
  vlibras?: VLibrasLoaderOptions;
  autoStart?: boolean;       // default: true
  speed?: number;            // default: 1
  onTranscript?: (text: string) => void;
}
```

#### `LibrasTranslatorApi`

```ts
interface LibrasTranslatorApi {
  containerRef: React.RefCallback<HTMLDivElement>;
  status: 'loading' | 'ready' | 'listening' | 'error';
  error: string | null;
  interim: string;      // transcricao parcial ao vivo
  listening: boolean;
  start: () => void;
  stop: () => void;
  translate: (text: string) => void;
  speed: number;
  setSpeed: (speed: number) => void;
}
```

#### Exemplo

```tsx
import { useLibrasTranslator } from 'libras-translator';

function Tradutor({ stream }: { stream: MediaStream }) {
  const { containerRef, status, interim, listening, start, stop } =
    useLibrasTranslator({
      audio: { kind: 'stream', stream },
      asr: { provider: 'deepgram', apiKey: import.meta.env.VITE_DEEPGRAM_KEY },
      autoStart: false,
    });

  return (
    <div>
      <div ref={containerRef} style={{ width: 320, height: 240 }} />
      <p>{interim}</p>
      <button onClick={listening ? stop : start}>
        {listening ? 'Parar' : 'Ouvir'}
      </button>
    </div>
  );
}
```

---

## Componentes

### `<LibrasTranslator>`

Componente pronto: avatar + ASR + controles embutidos (start/parar, velocidade, campo de texto).

```ts
interface LibrasTranslatorProps {
  audio?: AudioSource;
  asr?: ASROptions;
  vlibras?: VLibrasLoaderOptions;
  autoStart?: boolean;
  showCaptions?: boolean;
  speed?: number;
  controls?: boolean | { start?: boolean; speed?: boolean; text?: boolean };
  onTranscript?: (text: string) => void;
  className?: string;
  style?: React.CSSProperties;
  strings?: LibrasStrings;
  a11y?: A11yOptions;
}
```

`controls={false}` esconde todos os controles. `controls={{ speed: false }}` esconde apenas o controle de velocidade.

#### Exemplo

```tsx
import { LibrasTranslator } from 'libras-translator';

// Traduzir o microfone local (gratis, Chrome):
<LibrasTranslator
  audio={{ kind: 'microphone' }}
  showCaptions
  speed={1.2}
/>

// Traduzir audio remoto (Deepgram):
<LibrasTranslator
  audio={{ kind: 'stream', stream: remoteStream }}
  asr={{ provider: 'deepgram', apiKey: 'DG_KEY' }}
  controls={{ start: true, speed: true, text: false }}
/>
```

---

### `<LibrasChat>`

Chat assimetrico entre participantes. O estado de `messages` e o transporte sao gerenciados pelo app pai.

```ts
interface LibrasChatMessage {
  id: string;
  from: 'sender' | 'receiver'; // sender = quem fala/digita; receiver = quem ve em Libras
  text: string;
}

type LibrasChatRole = 'sender' | 'receiver';

interface LibrasChatProps {
  role: LibrasChatRole; // 'sender' = participante ouvinte; 'receiver' = participante surdo
  messages: LibrasChatMessage[];
  onSend: (text: string) => void;
  audio?: AudioSource;       // lado sender. Default: { kind: 'microphone' }
  asr?: ASROptions;          // lado sender. Default: webspeech pt-BR
  vlibras?: VLibrasLoaderOptions;
  speed?: number;            // default: 1.3
  labels?: { sender?: string; receiver?: string };
  className?: string;
  style?: React.CSSProperties;
  strings?: LibrasStrings;
  a11y?: A11yOptions;
}
```

#### Exemplo com WebSocket

```tsx
import { LibrasChat, type LibrasChatMessage } from 'libras-translator';

function ChatApp({ ws }: { ws: WebSocket }) {
  const [messages, setMessages] = useState<LibrasChatMessage[]>([]);

  useEffect(() => {
    ws.onmessage = (e) => {
      const msg: LibrasChatMessage = JSON.parse(e.data);
      setMessages((m) => [...m, msg]);
    };
  }, [ws]);

  const handleSend = (text: string) => {
    const msg: LibrasChatMessage = { id: crypto.randomUUID(), from: 'sender', text };
    setMessages((m) => [...m, msg]);
    ws.send(JSON.stringify(msg));
  };

  return (
    <LibrasChat
      role="sender"
      messages={messages}
      onSend={handleSend}
      labels={{ doctor: 'Medico', client: 'Paciente' }} {/* labels sao customizaveis para qualquer contexto */}
    />
  );
}
```

---

### `<LibrasChatPanel>`

Versao automanaged do chat. Estado interno; sem persistencia.

```ts
type LibrasChatPanelRole = 'speaker' | 'listener';

interface LibrasChatPanelProps {
  role: LibrasChatPanelRole;
  incomingMessage?: string;          // cada novo valor → nova mensagem no log
  onMessage?: (text: string) => void; // conecte ao seu transporte
  labels?: { speaker?: string; listener?: string }; // default: 'Professor'/'Aluno'
  audio?: AudioSource;
  asr?: ASROptions;
  speed?: number;                    // default: 1.3
  vlibras?: VLibrasLoaderOptions;
  className?: string;
  style?: React.CSSProperties;
}
```

#### Exemplo

```tsx
import { LibrasChatPanel } from 'libras-translator';

// Lado do ouvinte (surdo) — recebe texto via prop
<LibrasChatPanel
  role="listener"
  incomingMessage={ultimaMensagemRecebida}
/>

// Lado do falante (participante ouvinte) — envia texto via callback
<LibrasChatPanel
  role="speaker"
  onMessage={(text) => ws.send(text)}
/>
```

---

## ASR

### `AudioSource`

```ts
type AudioSource =
  | { kind: 'microphone' }
  | { kind: 'stream'; stream: MediaStream };
```

`microphone` — captura o microfone local. Compativel com Web Speech API (gratis).

`stream` — usa um `MediaStream` existente (audio de chamada WebRTC, por exemplo). Exige ASR de nuvem (Deepgram, AssemblyAI, Azure, etc.) ou implementacao customizada.

---

### `ASROptions`

```ts
type ASROptions =
  | { provider: 'webspeech'; lang?: string }
  | { provider: 'deepgram'; apiKey: string; lang?: string }
  | { provider: 'custom'; factory: ASRFactory };
```

| Provider | Custo | Funciona com | Requisitos |
|----------|-------|--------------|------------|
| `webspeech` | Gratis | `microphone` | Chrome / Edge; idioma do SO |
| `deepgram` | Pago | `microphone` ou `stream` | API key; Node proxy recomendado |
| `custom` | — | Qualquer | Implementar `ASRFactory` |

O `lang` padrao e `'pt-BR'` nos dois primeiros providers.

---

### `ASRFactory` e `CloudASR`

Interface para trazer seu proprio ASR.

```ts
type ASRFactory = (callbacks: {
  onPhrase: (text: string) => void;
  onInterim: (text: string) => void;
  onError: (err: Error) => void;
  onListening: (listening: boolean) => void;
}) => CloudASR;

interface CloudASR {
  start(stream: MediaStream): Promise<void>;
  stop(): void;
}
```

#### Exemplo de ASR customizado

```ts
import { ASRFactory } from 'libras-translator';

const myFactory: ASRFactory = ({ onPhrase, onInterim, onError, onListening }) => ({
  async start(stream) {
    onListening(true);
    // conectar ao seu servico de ASR...
    // chamar onPhrase(text) para cada frase final
    // chamar onInterim(text) para resultados parciais
  },
  stop() {
    onListening(false);
    // encerrar conexao
  },
});

<LibrasTranslator
  audio={{ kind: 'stream', stream }}
  asr={{ provider: 'custom', factory: myFactory }}
/>
```

---

### `withWebSpeechFallback`

Envolve uma `ASRFactory` primaria e cai no Web Speech API se o stream estiver vazio ou se `start()` lancar.

```ts
function withWebSpeechFallback(
  primaryFactory: ASRFactory,
  lang?: string,
): ASRFactory
```

#### Exemplo

```ts
import { withWebSpeechFallback } from 'libras-translator';

const robustFactory = withWebSpeechFallback(myDeepgramFactory, 'pt-BR');

<LibrasTranslator
  audio={{ kind: 'stream', stream }}
  asr={{ provider: 'custom', factory: robustFactory }}
/>
```

---

## Adapters

Importados de `'libras-translator'` (re-exportados de `src/libras/adapters/`).

### `audioStreamFromVideoParticipant`

Para SDKs que injetam um `<video>` em um elemento DOM (Vonage, Daily, Jitsi).

```ts
interface VideoParticipantLike {
  element?: HTMLElement;
  on(event: string, handler: (...args: unknown[]) => void): void;
}

function audioStreamFromVideoParticipant(p: VideoParticipantLike): MediaStream
```

---

### `audioStreamFromVideoParticipantAsync`

Versao assincrona que aguarda o evento de pronto antes de extrair o stream.

```ts
function audioStreamFromVideoParticipantAsync(
  p: VideoParticipantLike,
  readyEvent?: string,
): Promise<MediaStream>
```

| SDK | `readyEvent` padrao |
|-----|---------------------|
| Vonage / OpenTok | `'videoElementCreated'` |
| Daily.co | `'track-started'` |
| Jitsi | `'videoAvailable'` |

#### Exemplo (Vonage)

```ts
import { audioStreamFromVideoParticipantAsync } from 'libras-translator';

session.on('streamCreated', async (e) => {
  const subscriber = session.subscribe(e.stream, containerEl, opts);
  const stream = await audioStreamFromVideoParticipantAsync(subscriber);
  // passe stream para <LibrasTranslator> ou <LibrasChat>
});
```

---

### `audioStreamFromTrack`

```ts
function audioStreamFromTrack(track: MediaStreamTrack): MediaStream
```

---

### `audioStreamFromVideoElement`

```ts
function audioStreamFromVideoElement(
  el: HTMLVideoElement | HTMLAudioElement,
): MediaStream
```

---

### `audioStreamFromPeerConnection`

Extrai todas as faixas de audio recebidas de uma `RTCPeerConnection`.

```ts
function audioStreamFromPeerConnection(pc: RTCPeerConnection): MediaStream
```

---

### `CaptionSink`

Para plataformas que expoe legendas ao vivo mas nao o audio (Teams, Google Meet com caption API).

```ts
interface CaptionSink {
  push(text: string): void;  // chame com cada string de legenda ao vivo
  destroy(): void;
}

function createCaptionSink(
  translate: (text: string) => void,
  dedupeWindowMs?: number,  // ignora duplicatas neste intervalo (default: 3000 ms)
): CaptionSink
```

#### Exemplo

```ts
import { createCaptionSink, useLibrasAvatar } from 'libras-translator';

const { translate } = useLibrasAvatar();
const sink = createCaptionSink(translate, 2000);

// em outro lugar, quando a plataforma emite uma legenda:
captionEvent.on('caption', (text) => sink.push(text));

// ao desmontar:
sink.destroy();
```

---

## Core / Uso avancado

### `SignRenderer`

Interface implementada por `VLibrasSignRenderer`. Use para injecao de dependencia e testes.

```ts
interface SignRenderer {
  play(text: string): void;
  clear(): void;
  setSpeed(speed: number): void;
  busy: boolean;
  pending: number;
}
```

---

### `LibrasObserver`

Forma nao-React de acionar o avatar. Util em ambientes sem React ou para integracao em logica imperativa.

```ts
interface LibrasObserverOptions {
  renderer: SignRenderer;
  translatorUrl?: string;
}

class LibrasObserver {
  constructor(options: LibrasObserverOptions);
  observe(text: string): void;  // sinaliza o texto
  destroy(): void;
}
```

---

### `createVLibrasPlayer`

Carrega e inicializa o player Unity/WebGL. O `useLibrasAvatar` chama isso internamente. Use so se precisar de controle de baixo nivel.

```ts
function createVLibrasPlayer(
  container: HTMLElement,
  options?: VLibrasLoaderOptions,
): Promise<VLibrasPlayerLike>
```

O player e um **singleton por pagina**; chamadas subsequentes retornam a instancia existente.

---

### `VLibrasLoaderOptions`

```ts
interface VLibrasLoaderOptions {
  bundleUrl?: string;       // default: '/vlibras/vlibras.js'
  targetPath?: string;      // default: CDN jsDelivr (assets WASM ~13 MB)
  avatar?: string;          // 'icaro' (default) | 'hozana' | outros
  translatorUrl?: string;   // default: 'https://traducao2.vlibras.gov.br/translate'
}
```

Para uso offline, passe `targetPath: '/vlibras/target'` e sirva os arquivos localmente. Ver [docs/vlibras-setup.md](../vlibras-setup.md).

---

## i18n — `LibrasStrings`

Todas as strings visiveis ao usuario sao customizaveis. Passe via `<LibrasProvider>` ou diretamente em cada componente.

```ts
interface LibrasStrings {
  avatarLoading?: string;
  captionPlaceholder?: string;
  buttonTranslate?: string;
  buttonStop?: string;
  buttonSubmitText?: string;
  buttonSpeedLabel?: string;
  chatSendButton?: string;
  chatSenderPlaceholder?: string;
  chatReceiverPlaceholder?: string;
  chatMicStart?: string;
  chatMicStop?: string;
}
```

Os valores padrao estao em `DEFAULT_STRINGS` (exportado de `'libras-translator'`).

#### Exemplo

```tsx
import { LibrasProvider, DEFAULT_STRINGS } from 'libras-translator';

<LibrasProvider
  config={{
    strings: {
      ...DEFAULT_STRINGS,
      buttonTranslate: 'Iniciar traducao',
      chatMicStart: 'Microfone ligado',
      chatMicStop: 'Microfone desligado',
    },
  }}
>
  <App />
</LibrasProvider>
```

---

## `A11yOptions`

```ts
interface A11yOptions {
  avatarLabel?: string;            // aria-label do container. Default: "Avatar de Libras"
  respectReducedMotion?: boolean;  // pausa animacoes se prefers-reduced-motion. Default: true
}
```
