# Referência da API — libras-kit

Todos os exports públicos vêm de `'libras-kit'` (ou do caminho relativo enquanto o pacote não for publicado).

---

## `<LibrasProvider>`

Configura defaults globais para toda a árvore React. Totalmente opt-in — nenhum componente exige o provider.

```tsx
import { LibrasProvider } from 'libras-kit';

<LibrasProvider
  config={{
    vlibras: { avatar: 'hozana', translatorUrl: '/vlibras-translate' },
    asr: { provider: 'webspeech', lang: 'pt-BR' },
    strings: { micStart: 'Iniciar' },
    a11y: { avatarLabel: 'Intérprete de Libras', respectReducedMotion: true },
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

## `<LibrasAvatar>`

Componente principal. Headless: sem CSS padrão — estilize via `classNames` e `styles`.

```ts
interface LibrasAvatarProps {
  audio?: AudioSource;              // default: { kind: 'microphone' }
  asr?: ASROptions;                 // default: webspeech pt-BR
  autoStart?: boolean;              // default: true
  vlibras?: VLibrasLoaderOptions;
  speed?: number;                   // default: 1
  showChat?: boolean;               // default: false
  onSend?: (text: string) => void;
  onTranscript?: (text: string) => void;
  classNames?: LibrasAvatarClassNames;
  styles?: LibrasAvatarStyles;
  strings?: Partial<LibrasStrings>;
}
```

### `LibrasAvatarClassNames` / `LibrasAvatarStyles`

Cada chave corresponde a uma parte do componente:

| Chave | Elemento |
|-------|----------|
| `root` | container raiz |
| `avatar` | `<div>` onde o Unity renderiza |
| `chat` | container do chat (só com `showChat`) |
| `messages` | `<ul>` com o histórico |
| `message` | cada `<li>` de mensagem |
| `input` | `<input>` de texto |

```tsx
<LibrasAvatar
  showChat
  classNames={{ root: 'widget', avatar: 'stage', chat: 'chat', message: 'bubble' }}
  styles={{ root: { borderRadius: 8 } }}
/>
```

### `LibrasMessage`

```ts
interface LibrasMessage {
  id: string;
  text: string;
  source: 'speech' | 'typed'; // veio do microfone ou foi digitado
}
```

---

## Hooks

### `useLibrasAvatar`

Hook de baixo nível que controla apenas o avatar (sem ASR).

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
  translate: (text: string) => void;  // sinaliza texto (com fila; sem sobreposição)
  speed: number;
  setSpeed: (speed: number) => void;
  renderer: SignRenderer | null;       // uso avançado (LibrasObserver)
}
```

#### Exemplo

```tsx
import { useLibrasAvatar } from 'libras-kit';

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

Compõe `useLibrasAvatar` com captura de áudio e ASR.

```ts
function useLibrasTranslator(options: UseLibrasTranslatorOptions): LibrasTranslatorApi
```

#### `UseLibrasTranslatorOptions`

```ts
interface UseLibrasTranslatorOptions {
  audio?: AudioSource;        // default: { kind: 'microphone' }
  asr?: ASROptions;           // default: webspeech pt-BR
  vlibras?: VLibrasLoaderOptions;
  autoStart?: boolean;        // default: true
  speed?: number;             // default: 1
  onTranscript?: (text: string) => void;
}
```

#### `LibrasTranslatorApi`

```ts
interface LibrasTranslatorApi {
  containerRef: React.RefCallback<HTMLDivElement>;
  status: 'loading' | 'ready' | 'listening' | 'error';
  error: string | null;
  interim: string;      // transcrição parcial ao vivo
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
import { useLibrasTranslator } from 'libras-kit';

function Tradutor({ stream }: { stream: MediaStream }) {
  const { containerRef, status, interim, listening, start, stop } =
    useLibrasTranslator({
      audio: { kind: 'stream', stream },
      asr: { provider: 'custom', factory: myDeepgramFactory },
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

## ASR

### `AudioSource`

```ts
type AudioSource =
  | { kind: 'microphone' }
  | { kind: 'stream'; stream: MediaStream };
```

`microphone` — captura o microfone local. Compatível com Web Speech API (grátis).

`stream` — usa um `MediaStream` existente (áudio de chamada WebRTC, por exemplo). Exige ASR de nuvem ou implementação customizada.

---

### `ASROptions`

```ts
type ASROptions =
  | { provider: 'webspeech'; lang?: string }
  | { provider: 'custom'; factory: ASRFactory };
```

| Provider | Custo | Funciona com | Requisitos |
|----------|-------|--------------|------------|
| `webspeech` | Grátis | `microphone` | Chrome / Edge |
| `custom` | — | Qualquer | Implementar `ASRFactory` |

O `lang` padrão é `'pt-BR'` no provider `webspeech`.

---

### `ASRFactory` e `CloudASR`

```ts
interface CloudASRCallbacks {
  onTranscript: (text: string, final: boolean) => void;
  onError: (error: string) => void;
}

type ASRFactory = (callbacks: CloudASRCallbacks) => CloudASR;

interface CloudASR {
  start(stream: MediaStream): Promise<void>;
  stop(): void;
}
```

#### Exemplo

```ts
import type { ASRFactory } from 'libras-kit';

const myFactory: ASRFactory = ({ onTranscript, onError }) => ({
  async start(stream) {
    // conectar ao seu serviço de ASR com `stream`
    // chamar onTranscript(text, true)  para cada frase final
    // chamar onTranscript(text, false) para resultados parciais
    // chamar onError(mensagem) em caso de falha
  },
  stop() { /* encerrar conexão */ },
});
```

---

### `withWebSpeechFallback`

Envolve uma `ASRFactory` primária e cai no Web Speech API se o stream estiver vazio ou se `start()` lançar.

```ts
function withWebSpeechFallback(primaryFactory: ASRFactory, lang?: string): ASRFactory
```

---

## Adapters

Importados de `'libras-kit'` (re-exportados de `adapters/`).

### `audioStreamFromVideoParticipant`

```ts
function audioStreamFromVideoParticipant(p: VideoParticipantLike): MediaStream
```

### `audioStreamFromVideoParticipantAsync`

```ts
function audioStreamFromVideoParticipantAsync(
  p: VideoParticipantLike,
  readyEvent?: string,
): Promise<MediaStream>
```

### `audioStreamFromTrack`

```ts
function audioStreamFromTrack(track: MediaStreamTrack): MediaStream
```

### `audioStreamFromVideoElement`

```ts
function audioStreamFromVideoElement(el: HTMLVideoElement | HTMLAudioElement): MediaStream
```

### `audioStreamFromPeerConnection`

```ts
function audioStreamFromPeerConnection(pc: RTCPeerConnection): MediaStream
```

### `CaptionSink`

Para plataformas que expõem legendas ao vivo mas não o áudio (Teams, Google Meet com caption API).

```ts
function createCaptionSink(
  translate: (text: string) => void,
  dedupeWindowMs?: number,  // ignora duplicatas neste intervalo (default: 3000 ms)
): CaptionSink

interface CaptionSink {
  push(text: string): void;
  destroy(): void;
}
```

---

## Core / Uso avançado

### `SignRenderer`

```ts
interface SignRenderer {
  play(text: string): void;
  clear(): void;
  setSpeed(speed: number): void;
  dispose(): void;
  busy: boolean;
  pending: number;
}
```

### `LibrasObserver`

Forma não-React de acionar o avatar. Útil em ambientes sem React ou para integração em lógica imperativa.

```ts
class LibrasObserver {
  constructor(renderer: SignRenderer, opts?: LibrasObserverOptions);
  observe(texts: string[]): void;
  clearCache(): void;
  readonly cacheSize: number;
}
```

### `createVLibrasPlayer`

```ts
function createVLibrasPlayer(
  container: HTMLElement,
  options?: VLibrasLoaderOptions,
): Promise<VLibrasPlayerLike>
```

O player é um **singleton por página**.

### `VLibrasLoaderOptions`

```ts
interface VLibrasLoaderOptions {
  bundleUrl?: string;       // default: '/vlibras/vlibras.js'
  targetPath?: string;      // default: CDN jsDelivr (~13 MB)
  avatar?: string;          // 'icaro' (default) | 'hozana'
  translatorUrl?: string;   // default: 'https://traducao2.vlibras.gov.br/translate'
}
```

---

## i18n — `LibrasStrings`

```ts
interface LibrasStrings {
  avatarLoading?: string;       // default: 'Carregando avatar…'
  avatarAriaLabel?: string;     // default: 'Avatar de Libras'
  inputPlaceholder?: string;    // default: 'Digite uma mensagem…'
  inputSendButton?: string;     // default: 'Enviar'
  micStart?: string;            // default: '🎤 Ouvir'
  micStop?: string;             // default: '⏹ Parar'
}
```

```tsx
import { LibrasProvider } from 'libras-kit';

<LibrasProvider
  config={{
    strings: {
      micStart: 'Iniciar tradução',
      micStop: 'Parar',
      avatarLoading: 'Carregando intérprete...',
    },
  }}
>
  <App />
</LibrasProvider>
```

## `A11yOptions`

```ts
interface A11yOptions {
  avatarLabel?: string;            // aria-label do container. Default: 'Avatar de Libras'
  respectReducedMotion?: boolean;  // pausa animações se prefers-reduced-motion
}
```
