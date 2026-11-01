# examples/demo — Harness de Desenvolvimento

Aplicação Vite/React que demonstra as **5 formas de integração** da biblioteca
`libras-translator`. Cada spec é uma pasta independente: você pode copiar qualquer
uma delas e ajustar ao seu projeto sem entender as outras.

```bash
npm run dev   # http://localhost:5173 (use Chrome — microfone + MediaRecorder)
```

---

## O que a biblioteca expõe

```ts
import {
  // Hooks
  useLibrasTranslator,   // avatar + ASR integrados (ponto de entrada principal)
  useLibrasAvatar,       // só o avatar, sem microfone

  // Componentes prontos
  LibrasChat,            // chat assimétrico controlado pelo pai
  LibrasChatPanel,       // chat drop-in (estado interno)
  LibrasTranslator,      // avatar + controles de UI prontos

  // Configuração global
  LibrasProvider,
  useLibrasConfig,
} from 'libras-translator';
```

---

## Estrutura de arquivos

```
examples/demo/src/
  App.tsx                            ← tab navigator (SPEC_COMPONENTS map)
  main.tsx
  styles.css
  demos/
    index.ts                         ← barrel — exporta todos os specs
    Spec1Avatar/
      index.tsx                      ← orquestrador (JSX + wiring)
      hooks/
        useAvatarDemo.ts             ← texto + libras + handleSend
      components/
        AvatarControls.tsx           ← painel esquerdo de controles
      interfaces/
        AvatarControlsProps.ts
    Spec2Chat/
      index.tsx
      hooks/
        useChatMessages.ts           ← messages[] + sendAs(role)
      components/
        ChatParticipant.tsx          ← section + VideoBox + LibrasChat
      interfaces/
        ChatParticipantProps.ts
    Spec3ChatPanel/
      index.tsx
      hooks/
        useMemoryChannel.ts          ← canal bidirecional em memória
      components/
        PanelParticipant.tsx         ← section + LibrasChatPanel
      interfaces/
        PanelParticipantProps.ts
    Spec4Provider/
      index.tsx
      hooks/
        useProviderDemo.ts           ← canal + customLabel
      components/
        ProviderConfig.tsx           ← painel de configuração do provider
        ProviderParticipant.tsx      ← section + LibrasChatPanel
      interfaces/
        ProviderConfigProps.ts
        ProviderParticipantProps.ts
    Spec5Recorder/
      index.tsx
      presets.ts                     ← PRESETS, ASPECT, PresetId
      hooks/
        useCameraStream.ts           ← webcam + stream lifecycle
        useRecorder.ts               ← canvas compositing + MediaRecorder
  components/
    index.ts
    VideoBox.tsx                     ← caixa de vídeo (câmera real ou placeholder)
  hooks/
    index.ts
    useCamera.ts                     ← hook genérico de câmera
  utils/
    index.ts
    getCameraStream.ts
```

---

## Spec 1 — Avatar com posição livre

**API usada:** `useLibrasTranslator`

**Quando usar:** você quer controle total sobre onde o avatar aparece e como
o microfone é ativado.

```
useAvatarDemo()                    → texto + libras (LibrasTranslatorApi)
  └→ AvatarControls                → status, mic, speed, input manual
  └→ <div ref={libras.containerRef} />  ← avatar monta aqui (CSS livre)
```

**Código mínimo para replicar:**

```tsx
import { useLibrasTranslator } from 'libras-translator';

function MinhaView() {
  const libras = useLibrasTranslator({
    audio: { kind: 'microphone' },
    autoStart: false,
  });

  return (
    <>
      {/* Anexe containerRef onde quiser — o plugin não conhece o layout */}
      <div ref={libras.containerRef} style={{ width: 300, height: 200 }} />

      <button onClick={libras.start} disabled={libras.status !== 'ready'}>
        🎤 Ligar microfone
      </button>
      <button onClick={() => libras.translate('Olá, tudo bem?')}>
        Sinalizar texto
      </button>
    </>
  );
}
```

**API de `useLibrasTranslator`:**

| Campo | Tipo | Descrição |
|---|---|---|
| `containerRef` | `RefCallback<HTMLDivElement>` | Conecta o avatar ao DOM |
| `status` | `'loading' \| 'ready' \| 'listening' \| 'error'` | Estado atual |
| `error` | `string \| null` | Mensagem de erro se status = 'error' |
| `interim` | `string` | Transcrição parcial ao vivo |
| `listening` | `boolean` | Microfone ativo |
| `translate(text)` | `(text: string) => void` | Sinaliza um texto diretamente |
| `start()` | `() => void` | Liga o microfone |
| `stop()` | `() => void` | Desliga o microfone |
| `speed` | `number` | Velocidade atual (0.5–3) |
| `setSpeed(n)` | `(n: number) => void` | Muda a velocidade ao vivo |

---

## Spec 2 — Chat assimétrico controlado

**API usada:** `LibrasChat`

**Quando usar:** você tem um chat existente e quer adicionar tradução Libras.
O **pai gerencia `messages[]`** — ideal para persistência, timestamps customizados
e sincronização com backend.

```
useChatMessages()                    → messages[] + sendAs(role)
  └→ ChatParticipant (sender)        → VideoBox + LibrasChat role="sender"
  └→ ChatParticipant (receiver)      → VideoBox + LibrasChat role="receiver"
```

**Código mínimo para replicar:**

```tsx
import { LibrasChat, type LibrasChatMessage } from 'libras-translator';

function ChatControlado() {
  const [messages, setMessages] = useState<LibrasChatMessage[]>([]);

  const send = (role: 'sender' | 'receiver') => (text: string) =>
    setMessages((m) => [...m, { id: `${Date.now()}`, from: role, text }]);

  return (
    <LibrasChat
      role="sender"         // quem é o usuário local
      messages={messages}   // pai controla a lista
      onSend={send('sender')}
      labels={{ sender: 'Médico', receiver: 'Cliente' }}
    />
  );
}
```

**Props de `LibrasChat`:**

| Prop | Tipo | Descrição |
|---|---|---|
| `role` | `'sender' \| 'receiver'` | Lado do usuário local |
| `messages` | `LibrasChatMessage[]` | Lista controlada pelo pai |
| `onSend` | `(text: string) => void` | Callback de envio |
| `labels?` | `Record<LibrasChatRole, string>` | Nomes dos participantes |
| `vlibras?` | `LibrasConfig` | Config do avatar |
| `strings?` | `Partial<LibrasStrings>` | Customização de labels de UI |

---

## Spec 3 — Chat drop-in autogerenciado

**API usada:** `LibrasChatPanel`

**Quando usar:** você quer um chat funcional sem gerenciar mensagens.
O componente tem estado interno — você só passa `incomingMessage` e `onMessage`.

```
useMemoryChannel()                   → canal bidirecional em memória
  └→ PanelParticipant (speaker)      → LibrasChatPanel role="speaker"
  └→ PanelParticipant (listener)     → LibrasChatPanel role="listener"
```

**Código mínimo para replicar:**

```tsx
import { LibrasChatPanel } from 'libras-translator';

function ChatDropIn() {
  // Em produção: vem de um WebSocket, socket.io, etc.
  const [incomingText, setIncomingText] = useState('');

  return (
    <LibrasChatPanel
      role="speaker"
      incomingMessage={incomingText}          // mensagem recebida do outro lado
      onMessage={(text) => meuTransporte.send(text)}  // envio local
      labels={{ speaker: 'Médico', listener: 'Paciente' }}
    />
  );
}
```

**Diferença entre Spec 2 e Spec 3:**

| | `LibrasChat` (Spec 2) | `LibrasChatPanel` (Spec 3) |
|---|---|---|
| Estado das mensagens | Pai controla | Interno ao componente |
| Persistência | Você decide | Não (reset ao desmontar) |
| Timestamps custom | Sim | Não |
| Ideal para | Apps com backend | Protótipos, POCs rápidos |

---

## Spec 4 — Configuração global com LibrasProvider

**API usada:** `LibrasProvider` + `LibrasChatPanel`

**Quando usar:** você tem múltiplos componentes Libras e quer configurar
tudo em um único lugar sem passar props repetidas.

```
useProviderDemo()                    → canal + customLabel
  └→ ProviderConfig                  → input ao vivo para editar label
  └→ LibrasProvider                  → injeta config no context
       └→ ProviderParticipant x2     → herdam config sem prop local
```

**Código mínimo para replicar:**

```tsx
import { LibrasProvider, LibrasChatPanel } from 'libras-translator';

function App() {
  return (
    <LibrasProvider
      config={{
        speed: 2,
        translatorUrl: '/api/vlibras-translate',  // self-hosted (opcional)
        strings: { chatSendButton: 'Enviar ✓' },
      }}
    >
      {/* LibrasChatPanel herda speed=2 e o label customizado automaticamente */}
      <LibrasChatPanel role="speaker" incomingMessage="" onMessage={() => {}} />
    </LibrasProvider>
  );
}

// Props locais sobrescrevem o Provider:
// <LibrasChatPanel speed={1} ... />  ← usa speed=1, ignora o Provider
```

**Props de `LibrasProvider`:**

| Prop | Tipo | Descrição |
|---|---|---|
| `config.speed?` | `number` | Velocidade padrão (0.5–3) |
| `config.translatorUrl?` | `string` | URL do tradutor VLibras |
| `config.strings?` | `Partial<LibrasStrings>` | Labels globais de UI |
| `config.a11y?` | `A11yOptions` | Opções de acessibilidade |

---

## Spec 5 — Gravação com câmera

**API usada:** `useLibrasTranslator` + `MediaRecorder` (nativo)

**Quando usar:** você quer gravar um vídeo com o avatar Libras em
picture-in-picture sobre a câmera (YouTube 16:9, Reels 9:16, Feed 1:1).

```
useCameraStream()                    → videoRef + streamRef + enableCamera
useLibrasTranslator()                → avatar + ASR
useRecorder({ preset, refs })        → canvas compositing + MediaRecorder
  └→ Spec5Recorder (index.tsx)       ← wira os 3 hooks + controles de UI
```

**Como funciona o canvas compositing:**

```
câmera (webcam) ──┐
                  ├→ canvas offscreen (RAF 30fps) → MediaRecorder → .webm
avatar (Unity) ───┘   ↑ picture-in-picture na diagonal inferior direita
```

**Código mínimo para replicar:**

```tsx
import { useCallback, useRef, useState } from 'react';
import { useLibrasTranslator } from 'libras-translator';
// Hooks utilitários do Spec5 (copie para seu projeto):
import { useCameraStream } from './demos/Spec5Recorder/hooks/useCameraStream';
import { useRecorder } from './demos/Spec5Recorder/hooks/useRecorder';
import { PRESETS, type PresetId } from './demos/Spec5Recorder/presets';

function GravacaoLibras() {
  const containerElRef = useRef<HTMLDivElement | null>(null);
  const [presetId] = useState<PresetId>('youtube');
  const preset = PRESETS.find((p) => p.id === presetId)!;

  const { videoRef, streamRef, cameraOn, enableCamera } = useCameraStream();

  const libras = useLibrasTranslator({ audio: { kind: 'microphone' }, autoStart: false });
  const containerCallback = useCallback((el: HTMLDivElement | null) => {
    containerElRef.current = el;
    libras.containerRef(el);
  }, [libras.containerRef]);

  const { recording, startRecording, stopRecording } = useRecorder({
    preset, presetId,
    webcamVideoRef: videoRef,
    webcamStreamRef: streamRef,
    avatarContainerRef: containerElRef,
  });

  return (
    <div>
      <video ref={videoRef} autoPlay muted playsInline />
      <div ref={containerCallback} />
      {!cameraOn && <button onClick={enableCamera}>Ligar câmera</button>}
      <button
        onClick={recording ? stopRecording : startRecording}
        disabled={!cameraOn || libras.status === 'loading'}
      >
        {recording ? 'Parar e salvar' : '⏺ Gravar'}
      </button>
    </div>
  );
}
```

**Pré-requisitos:** Chrome (MediaRecorder API + `canvas.captureStream()`).

---

## Convenções aplicadas

Todas as specs seguem o guia `/react-clean` da lib:

| Regra | Onde aparece |
|---|---|
| **Nomenclatura** (`use` + PascalCase, `*Props`, `*Api`) | `useAvatarDemo`, `AvatarDemoApi`, `ChatParticipantProps` |
| **Single Responsibility** | Cada hook tem uma razão para mudar: `useChatMessages` só gerencia mensagens; `useMemoryChannel` só simula transporte |
| **Props explícitas via interface** | Todas as interfaces ficam em `interfaces/` de cada spec |
| **Barrel exports** | `demos/index.ts` expõe só o contrato público de cada spec |
| **Component map** | `App.tsx` usa `Record<Tab, ComponentType>` em vez de 5 condicionais |
| **Comentários explicam o porquê** | `useMemoryChannel` explica a convenção do canal; `useRecorder` explica o fallback de `roundRect` |
