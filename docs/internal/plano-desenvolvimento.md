# Plano de Desenvolvimento — libras-translator

## 1. Diagnóstico do estado atual

### O que já está implementado e funcionando

| Camada | Artefato | Estado |
|--------|----------|--------|
| Core | `SignRenderer` (interface) | Completa — inclui `play`, `clear`, `setSpeed`, `busy`, `pending`, `dispose` |
| Core | `VLibrasSignRenderer` | Completa — fila sincronizada, backlog com descarte FIFO, delega `setSpeed` ao player |
| Core | `createVLibrasPlayer` / `resetVLibrasPlayer` | Completo — singleton, CDN jsdelivr fixado por SHA, suporte a `translatorUrl`, `avatar` |
| Core | `LibrasObserver` | Completo — chunking por pontuação, prefetch de glosa, cache em memória |
| Core ASR | `createSpeechRecognizer` (Web Speech) | Completo — contínuo, reinício automático, `pt-BR` |
| Core ASR | `DeepgramASR` (cloud) | Completo — WebSocket streaming, `nova-2`, interim + final |
| Core ASR | `createPhraseSource` | Completo — unifica fonte de áudio e provedor ASR, deduplicação |
| UI | `useLibrasAvatar` | Completo — singleton do renderer, `speed`/`setSpeed` expostos |
| UI | `useLibrasTranslator` | Completo — avatar + ASR + status combinado |
| UI | `LibrasTranslator` | Completo — componente pronto, controles configuráveis, ciclo de velocidade 1×→2× |
| UI | `LibrasChat` | Completo — chat assimétrico controlado, agnóstico de transporte, roles `doctor`/`client` |
| Adapters | `webrtc.ts` | Completo — `audioStreamFromTrack`, `audioStreamFromVideoElement`, `audioStreamFromPeerConnection` |
| Adapters | `vonage.ts` | Completo — sync e async, tipagem estrutural (sem dependência de runtime) |
| Adapters | `captions.ts` | Completo — sink de legendas deduplicado, ideal para Teams |
| Build | `vite.config.ts` (lib mode) | Configurado — ESM, `peerDeps` React externalizados, `vite-plugin-dts` |
| Testes | `vlibras-renderer.test.ts` | 5 casos com `FakePlayer`, cobrindo fila, backlog e `clear` |

### Gaps em relação aos requisitos

**Escopo 1 — Velocidade:**
- `setSpeed` já existe em todos os níveis mas depende do player real implementar o método (marcado como `optional` em `VLibrasPlayerLike`). Se o bundle atual ignora a chamada, o controle é silenciosamente inoperante.
- O range 1×→2× está hard-coded em `LibrasTranslator`. `LibrasChat` expõe `speed` como prop mas sem UI de ajuste para o usuário final.

**Escopo 2 — ASR agnóstico de provedor:**
- `CloudASRConfig.provider` é uma union fechada (`'none' | 'deepgram'`). Adicionar AssemblyAI, Azure, Google ou um provedor corporativo exige modificar `cloud-asr.ts` (viola Open/Closed).
- Sem mecanismo de injeção de implementação customizada (`factory`/`plugin`). **Premissa nova: o core deve ser zero-opinião sobre provedor** — nenhum SDK externo vive dentro de `core/asr/`.
- `AudioSource` não cobre `tabCapture` (extensão Chrome para capturar áudio de aba).

**Escopo 3 — Adapters de videochamada:**
- Faltam: Zoom Web SDK, Daily.co, Jitsi Meet External API, Twilio Programmable Video.
- Teams: já coberto via `captions.ts` (a plataforma não expõe áudio bruto de chamadas).

**Escopo 4 — LibrasChat plugável:**
- Roles semânticas fixas (`doctor` / `client`). Labels são configuráveis, mas a lógica de quem captura áudio vs. quem vê o avatar está acoplada aos nomes dos roles.
- Sem slot para vídeo embutido (o `VideoBox` do demo é local).
- Sem callbacks de estado do avatar (`onAvatarReady`, `onSignStart`, `onSignEnd`).
- Sem tokens CSS para customização de tema sem fork do CSS.
- `LibrasChatMessage` não tem campo `timestamp` nem metadata.

**Escopo 5 — Publicação npm:**
- O CSS (`LibrasChat.css`) não é importado automaticamente pelo bundle — o consumidor precisa importar `libras-translator/dist/style.css` manualmente (e isso não está documentado).
- Sem `sideEffects: false` no `package.json` (prejudica tree-shaking em alguns bundlers).
- Não publicado no npm. Sem workflow de release automatizado (Changesets/semantic-release).
- `getLibrasEnv()` usa `import.meta.env` (Vite-specific) e vaza para o bundle publicado — quebraria em apps que não usam Vite.

---

## 2. Plano de desenvolvimento por escopo

---

### Escopo 1 — Controle de velocidade do VLibras

**Objetivo:** Garantir que a velocidade do avatar seja ajustável em runtime e confirmar que o player real do VLibras responde à chamada `setSpeed()`. Tornar o range configurável.

**Entregáveis:**
1. Confirmação experimental (ou workaround documentado) de que `player.setSpeed(n)` tem efeito no bundle público.
2. Props `minSpeed`, `maxSpeed`, `speedStep` em `LibrasTranslator` e `LibrasChat`.
3. Controle de velocidade visível no lado cliente do `LibrasChat`.
4. Teste unitário cobrindo `setSpeed` no `VLibrasSignRenderer` com `FakePlayer`.

**Interfaces TypeScript relevantes:**

```typescript
// Já existe — sem alteração necessária:
export interface SignRenderer {
  setSpeed(speed: number): void;
}

// Modificar em LibrasTranslator.tsx:
export interface LibrasTranslatorProps extends UseLibrasTranslatorOptions {
  minSpeed?: number;   // default: 0.5
  maxSpeed?: number;   // default: 3.0
  speedStep?: number;  // default: 0.25
}

// Modificar em LibrasChatProps.ts:
export interface LibrasChatProps {
  speed?: number;             // default: 1.3
  showSpeedControl?: boolean; // default: false (lado cliente)
  minSpeed?: number;
  maxSpeed?: number;
  // ... props existentes
}
```

**Arquivos a modificar:**
- `src/libras/ui/LibrasTranslator.tsx` — tornar range configurável via props; extrair constantes `SPEED_MIN/MAX/STEP`
- `src/libras/ui/interfaces/LibrasChatProps.ts` — adicionar `showSpeedControl`, `minSpeed`, `maxSpeed`
- `src/libras/ui/components/ClientSide/ClientSide.tsx` — aceitar e passar `showSpeedControl`
- `src/test/vlibras-renderer.test.ts` — adicionar teste de `setSpeed`

**Arquivos a criar:**
- `src/test/speed.test.ts` — testa ciclo de velocidade e clamp fora do range

**Investigação necessária (antes de implementar):**
```bash
# No console do demo em http://localhost:5173, após carregar o avatar:
window.VLibras.playerInstance?.setSpeed?.(2)
# Se o avatar acelerar visivelmente: o método existe e funciona.
# Se nada acontecer: documentar como "feature sem efeito no player atual"
# e implementar via workaround de fator de duração na fila.
```

**Critérios de aceite:**
- O slider/botão altera o valor de `speed` no estado e chama `renderer.setSpeed(n)`.
- Clamping: valores fora de `[minSpeed, maxSpeed]` são rejeitados com warning em dev.
- `LibrasChat` com `showSpeedControl={true}` exibe o controle ao lado cliente.
- Teste passa sem o player real.

---

### Escopo 2 — ASR 100% agnóstico de provedor

**Princípio arquitetural:** O subsistema de ASR é **zero-opinião sobre provedor**. A lib não tem e nunca terá dependência de runtime em Deepgram, AssemblyAI, Azure Speech, Google ou qualquer serviço externo. O core exporta exclusivamente contratos (interfaces TypeScript) e mecanismo de fila/deduplicação. Quem integra escolhe e instancia o provedor.

**Problema atual:** `ASROptions` tem union fechada (`'deepgram'`), forçando o core a conhecer cada SDK. `createCloudASR` tem `switch` interno que instancia `DeepgramASR` — a fábrica é fechada.

**Objetivo:** Tornar o sistema de ASR verdadeiramente extensível (Open/Closed). Qualquer integrador pode injetar seu próprio provedor sem modificar o core. Provedores prontos (Deepgram, AssemblyAI, Azure, Google) ficam em `providers/` fora do core.

**Entregáveis:**
1. `ASROptions` com variante `custom` para injeção de `factory`.
2. Provedores extras: `assemblyai`, `azure`, `google`.
3. `AudioSource` estendida com `{ kind: 'tab'; streamId: string }` para `chrome.tabCapture`.
4. Documentação de como registrar um provedor customizado.

**Contrato estável pós-E2:**

```typescript
// src/libras/core/asr/cloud-asr.ts — NOVO contrato público
export interface CloudASR {
  start(stream: MediaStream): Promise<void>;
  stop(): void;
}
export interface CloudASRCallbacks {
  onTranscript: (text: string, final: boolean) => void;
  onError: (error: string) => void;
}
// Qualquer provedor implementa esta assinatura e pode ser injetado:
export type ASRFactory = (callbacks: CloudASRCallbacks) => CloudASR;

// phrase-source.ts — ASROptions simplificado (sem nomes de serviços externos)
export type ASROptions =
  | { provider: 'webspeech'; lang?: string }
  | { provider: 'custom'; factory: ASRFactory };  // todos os outros passam por aqui

// phrase-source.ts — AudioSource estendida
export type AudioSource =
  | { kind: 'microphone' }
  | { kind: 'stream'; stream: MediaStream }
  | { kind: 'tab'; streamId: string };  // chrome.tabCapture
```

**Provedores prontos (fora do core — `providers/`):**

```typescript
// src/libras/providers/deepgram.ts — consumidor importa se quiser Deepgram
import type { ASRFactory } from '../core/asr/cloud-asr';
export function createDeepgramFactory(apiKey: string, lang = 'pt-BR'): ASRFactory { ... }

// src/libras/providers/assemblyai.ts
export function createAssemblyAIFactory(opts: { apiKey: string; lang?: string }): ASRFactory { ... }

// src/libras/providers/azure.ts (importação dinâmica do SDK)
export function createAzureFactory(opts: { subscriptionKey: string; region: string }): ASRFactory { ... }

// src/libras/providers/google.ts (REST, sem SDK)
export function createGoogleFactory(opts: { apiKey: string }): ASRFactory { ... }
```

**Arquivos a criar:**
- `src/libras/providers/deepgram.ts` (mover de `core/asr/cloud-asr.ts`)
- `src/libras/providers/assemblyai.ts`
- `src/libras/providers/azure.ts`
- `src/libras/providers/google.ts`
- `src/test/asr-registry.test.ts`

**Arquivos a modificar:**
- `src/libras/core/asr/cloud-asr.ts` — apenas contrato (`CloudASR`, `ASRFactory`, `CloudASRCallbacks`)
- `src/libras/core/asr/phrase-source.ts` — `ASROptions` com `'custom'` + handle de `{ kind: 'tab' }`
- `src/libras/index.ts` — exportar `CloudASR`, `ASRFactory`, `CloudASRCallbacks`

**Invariantes:**
- `core/asr/` não importa nenhum SDK externo.
- `ASROptions.provider` nunca lista nome de serviço de terceiro.
- Adicionar novo provedor = criar um arquivo em `providers/`; nenhuma linha do core muda.

**Migração sem breaking change:**
```typescript
// Antes (Deepgram hardcoded):
asr={{ provider: 'deepgram', apiKey: DEEPGRAM_KEY }}

// Depois (agnóstico):
import { createDeepgramFactory } from 'libras-translator/providers/deepgram';
asr={{ provider: 'custom', factory: createDeepgramFactory(DEEPGRAM_KEY) }}
```

**Regra de compatibilidade áudio ↔ ASR:**
```
microfone → webspeech ✓        stream → webspeech ✗ (erro claro)
microfone → custom (qualquer provedor) ✓
stream    → custom (qualquer provedor) ✓
```

**Critérios de aceite:**
- `{ provider: 'custom', factory: myFn }` funciona end-to-end sem modificar arquivos do core.
- O build não inclui nenhum SDK externo no bundle base.
- Testes com `CloudASR` mockado passam sem rede.

---

### Escopo 3 — Adapters de videochamada

**Objetivo:** Oferecer adapters prontos para as plataformas mais usadas. Cada adapter transforma o objeto "participante" da plataforma em `MediaStream`.

**Entregáveis:**
1. `daily.ts` — Daily.co
2. `zoom.ts` — Zoom Web SDK (bridge via AudioContext)
3. `jitsi.ts` — Jitsi Meet External API
4. `twilio.ts` — Twilio Programmable Video
5. Documentação por plataforma

**Complexidade por plataforma:**

| Plataforma | Complexidade | Motivo |
|-----------|-------------|--------|
| Daily.co | Baixa | `participant.tracks.audio.persistentTrack` é um `MediaStreamTrack` nativo |
| Twilio | Baixa | `audioTrack.mediaStreamTrack` é nativo; padrão idêntico ao Vonage |
| Vonage | Já feito | — |
| Jitsi | Média | Acesso via iframe + `RTCPeerConnection.getReceivers()` |
| Zoom Web SDK | Alta | Não expõe `MediaStream` nativo; requer bridge via `AudioContext` |
| Teams | Não disponível | A plataforma bloqueia acesso ao áudio — usar `captions.ts` |

**Arquivos a criar:**
- `src/libras/adapters/daily.ts`
- `src/libras/adapters/zoom.ts`
- `src/libras/adapters/jitsi.ts`
- `src/libras/adapters/twilio.ts`
- Atualizar `src/libras/adapters/index.ts`

**Padrão de interface (tipagem estrutural, sem deps de runtime):**

```typescript
// daily.ts
export function audioStreamFromDailyParticipant(
  participant: DailyParticipantLike
): MediaStream | null;

export function watchDailyParticipant(
  callObject: DailyCallObjectLike,
  sessionId: string,
  onStream: (stream: MediaStream) => void
): () => void;  // retorna unsubscribe

// twilio.ts
export function watchTwilioParticipant(
  participant: TwilioRemoteParticipantLike,
  onStream: (stream: MediaStream) => void
): () => void;

// zoom.ts — bridge necessária pois Zoom não expõe MediaStream nativo
export async function audioStreamFromZoomParticipant(
  zoomClient: ZoomClientLike,
  userId: number
): Promise<MediaStream>;
```

**Critérios de aceite:**
- Cada adapter compila sem dependências de runtime do SDK correspondente.
- O adapter Zoom não quebra apps que não usam Zoom (importação lazy).
- Documentação com snippet mínimo por plataforma.

---

### Escopo 4 — LibrasChat plugável

**Objetivo:** Tornar o `LibrasChat` mais adaptável: roles renomeáveis, slot de vídeo, callbacks de estado do avatar, customização visual por CSS tokens.

**Entregáveis:**
1. `roleConfig` para renomear roles e trocar qual lado usa áudio vs. avatar.
2. Prop `videoSlot` para embutir o vídeo da chamada dentro do chat.
3. Callbacks `onAvatarReady`, `onSignStart`, `onSignEnd`.
4. CSS custom properties para tema (cores, bordas, fontes).
5. Campo `timestamp` e `metadata` em `LibrasChatMessage`.
6. Prop `renderMessage` para bolhas customizadas.

**Interfaces TypeScript:**

```typescript
export interface LibrasChatMessage {
  id: string;
  from: LibrasChatRole;
  text: string;
  timestamp?: number;                       // NOVO
  metadata?: Record<string, unknown>;       // NOVO
}

export interface LibrasChatRoleConfig {
  label: string;
  mode: 'sender' | 'receiver';
}

export interface LibrasChatProps {
  role: LibrasChatRole;
  messages: LibrasChatMessage[];
  onSend: (text: string) => void;
  roleConfig?: Partial<Record<LibrasChatRole, LibrasChatRoleConfig>>;  // NOVO
  videoSlot?: React.ReactNode;                                          // NOVO
  onAvatarReady?: () => void;                                           // NOVO
  onSignStart?: (text: string) => void;                                 // NOVO
  onSignEnd?: (text: string) => void;                                   // NOVO
  renderMessage?: (msg: LibrasChatMessage, side: 'mine' | 'theirs') => React.ReactNode; // NOVO
  showSpeedControl?: boolean;
  speed?: number;
  minSpeed?: number;
  maxSpeed?: number;
  className?: string;
  style?: React.CSSProperties;
}
```

**CSS custom properties (LibrasChat.css):**

```css
.libras-chat {
  --libras-chat-bg: #f8f9fa;
  --libras-chat-bubble-mine: #0084ff;
  --libras-chat-bubble-theirs: #e4e6eb;
  --libras-chat-text-mine: #fff;
  --libras-chat-text-theirs: #1c1e21;
  --libras-chat-font: system-ui, sans-serif;
  --libras-chat-radius: 18px;
  --libras-chat-avatar-height: 300px;
}
```

**Arquivos a modificar:**
- `src/libras/ui/interfaces/LibrasChatProps.ts`
- `src/libras/ui/LibrasChat.tsx`
- `src/libras/ui/components/ClientSide/ClientSide.tsx`
- `src/libras/ui/components/DoctorSide/DoctorSide.tsx`
- `src/libras/ui/LibrasChat.css`

**Critérios de aceite:**
- Trocar `role="doctor"` por labels customizadas sem alterar o componente.
- `videoSlot={<video ref={videoRef} />}` renderiza o vídeo dentro do painel.
- `onSignEnd` dispara quando o avatar termina cada frase.
- `renderMessage` substitui a bolha padrão completamente.
- Retrocompatibilidade total — todas as adições são opcionais.

---

### Escopo 5 — Empacotamento como lib ESM

**Objetivo:** Tornar a lib publicável e consumível por qualquer app React, independente de bundler.

**Entregáveis:**
1. `package.json` com `sideEffects`, exports de CSS, versão 1.0.
2. `getLibrasEnv()` removido do bundle público.
3. Workflow GitHub Actions de release via Changesets.
4. Teste de consumo em app Vite virgem.

**Mudanças em `package.json`:**

```json
{
  "sideEffects": ["**/*.css"],
  "exports": {
    ".": {
      "import": "./dist/libras-translator.js",
      "types": "./dist/index.d.ts"
    },
    "./style.css": "./dist/style.css"
  },
  "files": ["dist", "CHANGELOG.md"]
}
```

**Refatoração de `getLibrasEnv()`:**
- Remover de `src/libras/index.ts` (não é API pública)
- Mover helper para `examples/` apenas

**Vite config:**
```typescript
build: {
  cssCodeSplit: false,  // um único style.css
}
```

**Arquivos a criar:**
- `.changeset/config.json`
- `.github/workflows/release.yml`
- `.github/workflows/ci.yml`

**Critérios de aceite:**
- `npm pack` gera `.tgz` que compila e renderiza em app Vite virgem.
- CSS aplicado com `import 'libras-translator/style.css'`.
- CI passa em PRs (typecheck + testes).
- `CHANGELOG.md` atualizado automaticamente via Changesets.

---

---

### Escopo 6 — Biblioteca de componentes de alto nível

**Posicionamento:** A lib core (`libras-translator`) é a camada de primitivos: hooks, player, ASR, adapters. O E6 é a camada de produto: componentes completos, pré-estilizados, com UX pronta. Quem quer controle total usa os primitivos. Quem quer integrar em minutos usa `/components`.

**Arquitetura:** pacote único com entry point separado no `package.json`:

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./components": "./dist/components/index.js",
    "./providers/deepgram": "./dist/providers/deepgram.js",
    "./providers/assemblyai": "./dist/providers/assemblyai.js"
  }
}
```

**Estrutura de diretórios:**
```
src/libras/
  components/                   ← NOVO — E6
    LibrasChatBottomSheet/
    LibrasAvatarFloating/
    LibrasTranslatorPanel/
    LibrasAvatarPiP/
    tokens.css                  ← design tokens compartilhados
    index.ts
  providers/                    ← NOVO — provedores de ASR externos (E2)
    deepgram.ts
    assemblyai.ts
    azure.ts
    google.ts
```

**Catálogo inicial de componentes:**

| Componente | Descrição |
|---|---|
| `LibrasChatBottomSheet` | Bottom sheet com avatar (topo) + chat assimétrico (baixo) |
| `LibrasAvatarFloating` | Avatar flutuante draggável, minimizável |
| `LibrasTranslatorPanel` | Painel lateral retrátil com avatar + controles |
| `LibrasAvatarPiP` | Avatar em picture-in-picture sobre elemento de vídeo |

---

#### `LibrasChatBottomSheet` (componente principal do E6)

Overlay deslizante de baixo para cima que combina:
- **Topo**: avatar VLibras sinalizando em Libras (recebe fala do médico/professor)
- **Baixo**: chat assimétrico `<LibrasChat>` — igual ao demo atual

Renderizado via `createPortal` em `document.body` para subir acima de qualquer `z-index` da videochamada host.

**Estados:**
```
CLOSED ── open() ──► OPEN (50vh) ── expand() ──► EXPANDED (90vh)
  ▲                      │                              │
  └── close() ───────────┘ ◄── collapse() ─────────────┘
```
Transições via CSS `transform: translateY()` — sem dependência de lib de animação.

**Interface TypeScript completa:**

```typescript
export type BottomSheetState = 'closed' | 'open' | 'expanded';

export interface LibrasChatBottomSheetProps {
  // Visibilidade
  open: boolean;
  onClose: () => void;

  // Chat
  role: LibrasChatRole;
  messages: LibrasChatMessage[];
  onSend: (text: string) => void;

  // Avatar e ASR
  audio?: AudioSource;           // default: { kind: 'microphone' }
  asr?: ASROptions;              // default: webspeech
  vlibras?: VLibrasLoaderOptions;
  speed?: number;                // default: 1.3

  // Dimensões
  defaultHeight?: string | number;  // default: '50vh'
  expandedHeight?: string | number; // default: '90vh'
  avatarRatio?: number;             // default: 0.45 (45% avatar, 55% chat)

  // Comportamento
  closeOnBackdrop?: boolean;     // default: true
  draggable?: boolean;           // default: true
  initialState?: 'open' | 'expanded';
  showCaptions?: boolean;        // legenda ao vivo sobre o avatar

  // Aparência
  labels?: {
    handleLabel?: string;
    closeLabel?: string;
    expandLabel?: string;
    collapseLabel?: string;
    chatLabels?: Partial<Record<LibrasChatRole, string>>;
  };
  className?: string;
  style?: React.CSSProperties;

  // Callbacks
  onStateChange?: (state: BottomSheetState) => void;
}
```

**Arquivos a criar:**
- `src/libras/components/LibrasChatBottomSheet/LibrasChatBottomSheet.tsx`
- `src/libras/components/LibrasChatBottomSheet/LibrasChatBottomSheet.css`
- `src/libras/components/LibrasChatBottomSheet/types.ts`
- `src/libras/components/LibrasChatBottomSheet/useBottomSheetDrag.ts`

---

#### `LibrasAvatarFloating`

Avatar flutuante posicionável por drag. Minimiza para bolha circular (não desmonta o player WebGL — sinalização continua enfileirada mesmo minimizado).

```typescript
interface LibrasAvatarFloatingProps {
  text?: string;
  onReady?: (api: { translate: (text: string) => void }) => void;
  initialPosition?: { top?: number; right?: number; bottom?: number; left?: number };
  constrainToViewport?: boolean; // default: true
  initialState?: 'open' | 'minimized';
  minimizedLabel?: string;
  minimizedSize?: number;        // px — default: 56
  width?: number;                // default: 200
  height?: number;               // default: 250
  vlibras?: VLibrasLoaderOptions;
  speed?: number;
}
```

---

#### `LibrasTranslatorPanel`

Painel lateral retrátil (drawer) com avatar + controles de ASR. Recolhe para aba fina na borda da tela. Ideal para apps desktop com layout fixo (ex.: prontuário eletrônico).

```typescript
interface LibrasTranslatorPanelProps {
  side?: 'left' | 'right';      // default: 'right'
  width?: number;               // default: 320 (px)
  open?: boolean;               // controlado — omitir para auto-gerenciado
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  audio?: AudioSource;
  asr?: ASROptions;
  vlibras?: VLibrasLoaderOptions;
  speed?: number;
  controls?: LibrasControls;
  showCaptions?: boolean;
  tabLabel?: string;            // default: 'Libras'
}
```

---

#### `LibrasAvatarPiP`

Avatar ancorado ao elemento `<video>` da videochamada — exibido como pip-within-pip. Segue o vídeo via `IntersectionObserver` + `getBoundingClientRect`.

```typescript
interface LibrasAvatarPiPProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  anchor?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'; // default: 'bottom-right'
  margin?: number;              // default: 12 (px)
  widthPercent?: number;        // % da largura do vídeo — default: 30
  text?: string;
  onReady?: (api: { translate: (text: string) => void }) => void;
  vlibras?: VLibrasLoaderOptions;
  speed?: number;
}
```

---

#### CSS Tokens (compartilhado entre todos os componentes E6)

```css
/* src/libras/components/tokens.css */
:root {
  --lbs-color-bg: #ffffff;
  --lbs-color-bg-elevated: #f8f9fa;
  --lbs-color-border: #e0e0e0;
  --lbs-color-text: #1a1a1a;
  --lbs-color-accent: #1976d2;
  --lbs-color-backdrop: rgba(0, 0, 0, 0.5);
  --lbs-font-family: system-ui, -apple-system, sans-serif;
  --lbs-radius-md: 8px;
  --lbs-radius-lg: 16px;
  --lbs-shadow-md: 0 4px 12px rgba(0,0,0,0.15);
  --lbs-z-backdrop: 1000;
  --lbs-z-sheet: 1001;
  --lbs-z-floating: 1002;
  --lbs-z-pip: 999;
  --lbs-transition-base: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

@media (prefers-color-scheme: dark) {
  :root {
    --lbs-color-bg: #121212;
    --lbs-color-bg-elevated: #1e1e1e;
    --lbs-color-border: #333333;
    --lbs-color-text: #f5f5f5;
    --lbs-color-backdrop: rgba(0, 0, 0, 0.7);
  }
}
```

Theming por instância (sem classes globais):
```tsx
<LibrasChatBottomSheet
  style={{
    '--lbs-color-bg': '#1e1e1e',
    '--lbs-color-text': '#f5f5f5',
    '--lbs-color-accent': '#90caf9',
  } as React.CSSProperties}
/>
```

**Critérios de aceite do E6:**
- Nenhum componente usa inline styles para aparência (apenas geometria dinâmica).
- `LibrasAvatarFloating` e `LibrasChatBottomSheet` na mesma página dividem o singleton do player WebGL via `useLibrasAvatar`.
- `createPortal` do bottom sheet sobe acima de qualquer app de videochamada host.
- Tree-shaker descarta todo o E6 para quem importa só de `'libras-translator'`.

---

## 3. Documentação por escopo

---

### Doc — Escopo 1: Controle de velocidade

#### Uso com `LibrasTranslator`

```tsx
import { LibrasTranslator } from 'libras-translator';
import 'libras-translator/style.css';

function App() {
  return (
    <LibrasTranslator
      audio={{ kind: 'microphone' }}
      controls={{ speed: true }}
      minSpeed={0.5}
      maxSpeed={3.0}
      speedStep={0.25}
    />
  );
}
```

#### Uso com hook (controle programático)

```tsx
const libras = useLibrasTranslator({ audio: { kind: 'microphone' } });

return (
  <div>
    <div ref={libras.containerRef} style={{ height: 300 }} />
    <input
      type="range"
      min={0.5} max={3} step={0.25}
      value={libras.speed}
      onChange={(e) => libras.setSpeed(Number(e.target.value))}
    />
    <span>{libras.speed.toFixed(2)}×</span>
  </div>
);
```

#### Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `speed` | `number` | `1` | Velocidade inicial |
| `minSpeed` | `number` | `0.5` | Mínimo do slider |
| `maxSpeed` | `number` | `3.0` | Máximo do slider |
| `speedStep` | `number` | `0.25` | Incremento por clique |

---

### Doc — Escopo 2: ASR agnóstico de provedor

#### Premissa de uso

A lib não inclui nenhum SDK de ASR no bundle base. Você importa apenas o provider que precisa.

#### Provedores disponíveis

| Provider | Import | Custo | Quando usar |
|----------|--------|-------|-------------|
| `webspeech` | built-in | Grátis | Dev, demos, Chrome |
| `deepgram` | `libras-translator/providers/deepgram` | ~$0.01/min | Produção, stream de chamada |
| `assemblyai` | `libras-translator/providers/assemblyai` | ~$0.012/min | Alta precisão PT-BR |
| `azure` | `libras-translator/providers/azure` | ~$0.016/min | Stack Microsoft |
| `google` | `libras-translator/providers/google` | ~$0.016/min | Stack GCP |
| customizado | — | Variável | Provedor corporativo |

#### Exemplos de configuração

```tsx
// Web Speech (grátis, nenhum import extra)
<LibrasTranslator asr={{ provider: 'webspeech', lang: 'pt-BR' }} />

// Deepgram (stream de chamada)
import { createDeepgramFactory } from 'libras-translator/providers/deepgram';
<LibrasTranslator
  audio={{ kind: 'stream', stream: remoteStream }}
  asr={{ provider: 'custom', factory: createDeepgramFactory(DEEPGRAM_KEY) }}
/>

// AssemblyAI
import { createAssemblyAIFactory } from 'libras-translator/providers/assemblyai';
<LibrasTranslator
  audio={{ kind: 'stream', stream: remoteStream }}
  asr={{ provider: 'custom', factory: createAssemblyAIFactory({ apiKey: ASSEMBLYAI_KEY, lang: 'pt' }) }}
/>

// Azure
import { createAzureFactory } from 'libras-translator/providers/azure';
<LibrasTranslator
  asr={{ provider: 'custom', factory: createAzureFactory({ subscriptionKey: AZ_KEY, region: 'brazilsouth' }) }}
/>
```

#### Provedor totalmente customizado

```typescript
import type { ASRFactory } from 'libras-translator';

const myFactory: ASRFactory = (cb) => ({
  async start(stream: MediaStream) {
    mySDK.onResult((text, isFinal) => cb.onTranscript(text, isFinal));
    mySDK.onError((msg) => cb.onError(msg));
    await mySDK.connect(stream);
  },
  stop() { mySDK.disconnect(); },
});

<LibrasTranslator asr={{ provider: 'custom', factory: myFactory }} />
```

---

### Doc — Escopo 3: Adapters de videochamada

#### Daily.co

```typescript
import { watchDailyParticipant } from 'libras-translator';

const unwatch = watchDailyParticipant(call, 'remote-session-id', (stream) => {
  setRemoteStream(stream);
});
// cleanup: unwatch()
```

#### Twilio

```typescript
import { watchTwilioParticipant } from 'libras-translator';

room.on('participantConnected', (participant) => {
  const unwatch = watchTwilioParticipant(participant, setRemoteStream);
  participant.on('disconnected', unwatch);
});
```

#### Jitsi

```typescript
import { audioStreamFromJitsiParticipant } from 'libras-translator';

api.addEventListeners({
  participantJoined: async ({ id }) => {
    const stream = await audioStreamFromJitsiParticipant(api, id);
    setRemoteStream(stream);
  },
});
```

#### Zoom Web SDK

```typescript
import { audioStreamFromZoomParticipant } from 'libras-translator';

zmClient.on('user-added', async (payload) => {
  // Nota: usa AudioContext como bridge — latência ~50ms
  const stream = await audioStreamFromZoomParticipant(zmClient, payload.userId);
  setRemoteStream(stream);
});
```

#### Teams (somente legendas — sem acesso ao áudio)

```typescript
import { createCaptionSink } from 'libras-translator';

const avatar = useLibrasAvatar();
const sink = createCaptionSink(avatar.translate);
microsoftTeams.liveShare.onCaption((caption) => {
  if (caption.isFinal) sink.push(caption.text);
});
```

#### WebRTC puro

```typescript
import { audioStreamFromPeerConnection } from 'libras-translator';

pc.ontrack = () => {
  const stream = audioStreamFromPeerConnection(pc);
  setRemoteStream(stream);
};
```

---

### Doc — Escopo 4: LibrasChat plugável

#### Uso básico (retrocompatível)

```tsx
<LibrasChat role="doctor" messages={messages} onSend={handleSend} />
<LibrasChat role="client" messages={messages} onSend={handleSend} />
```

#### Renomear roles (ex.: professor / aluno)

```tsx
<LibrasChat
  role="doctor"
  messages={messages}
  onSend={handleSend}
  roleConfig={{
    doctor: { label: 'Professor', mode: 'sender' },
    client: { label: 'Aluno',    mode: 'receiver' },
  }}
/>
```

#### Com vídeo embutido

```tsx
<LibrasChat
  role="client"
  messages={messages}
  onSend={handleSend}
  videoSlot={<video ref={remoteVideoRef} autoPlay playsInline />}
/>
```

#### Callbacks de estado do avatar

```tsx
<LibrasChat
  role="client"
  messages={messages}
  onSend={handleSend}
  onAvatarReady={() => console.log('Avatar carregado')}
  onSignStart={(text) => console.log('Sinalizando:', text)}
  onSignEnd={(text) => console.log('Terminou:', text)}
/>
```

#### Bolhas customizadas

```tsx
<LibrasChat
  role="doctor"
  messages={messages}
  onSend={handleSend}
  renderMessage={(msg, side) => (
    <div className={`minha-bolha minha-bolha--${side}`}>
      <span>{msg.text}</span>
      {msg.timestamp && <time>{new Date(msg.timestamp).toLocaleTimeString()}</time>}
    </div>
  )}
/>
```

#### Customização de tema via CSS

```css
.libras-chat {
  --libras-chat-bg: #1a1a2e;
  --libras-chat-bubble-mine: #e94560;
  --libras-chat-bubble-theirs: #16213e;
  --libras-chat-radius: 8px;
  --libras-chat-avatar-height: 400px;
}
```

#### Props completas

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `role` | `'doctor' \| 'client'` | — | Papel deste lado |
| `messages` | `LibrasChatMessage[]` | — | Histórico (controlado pelo app) |
| `onSend` | `(text: string) => void` | — | Chamado ao enviar |
| `audio` | `AudioSource` | `{ kind: 'microphone' }` | Fonte de áudio |
| `asr` | `ASROptions` | `{ provider: 'webspeech' }` | Motor de reconhecimento |
| `vlibras` | `VLibrasLoaderOptions` | — | Opções do avatar |
| `speed` | `number` | `1.3` | Velocidade inicial |
| `showSpeedControl` | `boolean` | `false` | Exibe controle de velocidade |
| `roleConfig` | `Record<role, RoleConfig>` | — | Renomeia roles e modos |
| `videoSlot` | `ReactNode` | — | Vídeo embutido no painel |
| `onAvatarReady` | `() => void` | — | Avatar carregou |
| `onSignStart` | `(text: string) => void` | — | Começou a sinalizar |
| `onSignEnd` | `(text: string) => void` | — | Terminou de sinalizar |
| `renderMessage` | `(msg, side) => ReactNode` | — | Bolha customizada |
| `className` | `string` | — | Classe CSS adicional |
| `style` | `CSSProperties` | — | Estilo inline |

---

### Doc — Escopo 6: Biblioteca de componentes

#### Instalação

```bash
npm install libras-translator
```

Importe do entry point `/components`:

```tsx
import 'libras-translator/style.css';
import { LibrasChatBottomSheet } from 'libras-translator/components';
```

#### `LibrasChatBottomSheet` — uso mínimo

```tsx
// Microfone + Web Speech API (grátis, sem chave)
const [open, setOpen] = useState(false);
const [messages, setMessages] = useState([]);

<button onClick={() => setOpen(true)}>Abrir Libras</button>

<LibrasChatBottomSheet
  open={open}
  onClose={() => setOpen(false)}
  role="doctor"
  messages={messages}
  onSend={(text) => setMessages(m => [...m, { id: crypto.randomUUID(), from: 'doctor', text }])}
/>
```

#### `LibrasChatBottomSheet` — com stream de videochamada (Vonage + Deepgram)

```tsx
import { LibrasChatBottomSheet } from 'libras-translator/components';
import { audioStreamFromVonageSubscriberAsync } from 'libras-translator';
import { createDeepgramFactory } from 'libras-translator/providers/deepgram';

function VonageConsultation({ subscriber, session }) {
  const [open, setOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    audioStreamFromVonageSubscriberAsync(subscriber).then(setStream);
  }, [subscriber]);

  const handleSend = (text) => {
    setMessages(m => [...m, { id: crypto.randomUUID(), from: 'doctor', text }]);
    session.signal({ type: 'chat', data: text });
  };

  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir Libras</button>

      {stream && (
        <LibrasChatBottomSheet
          open={open}
          onClose={() => setOpen(false)}
          role="doctor"
          messages={messages}
          onSend={handleSend}
          audio={{ kind: 'stream', stream }}
          asr={{ provider: 'custom', factory: createDeepgramFactory(DEEPGRAM_KEY) }}
          defaultHeight="55vh"
          avatarRatio={0.4}
          showCaptions
          labels={{ chatLabels: { doctor: 'Dr. Silva', client: 'Paciente' } }}
        />
      )}
    </>
  );
}
```

#### `LibrasChatBottomSheet` — com Daily.co + AssemblyAI

```tsx
import { watchDailyParticipant } from 'libras-translator';
import { createAssemblyAIFactory } from 'libras-translator/providers/assemblyai';

const unwatch = watchDailyParticipant(call, sessionId, (stream) => {
  setRemoteStream(stream);
});

<LibrasChatBottomSheet
  open={open}
  onClose={() => setOpen(false)}
  role="doctor"
  messages={messages}
  onSend={handleSend}
  audio={{ kind: 'stream', stream: remoteStream }}
  asr={{ provider: 'custom', factory: createAssemblyAIFactory({ apiKey: ASM_KEY }) }}
/>
```

#### `LibrasAvatarFloating` — uso

```tsx
import { LibrasAvatarFloating } from 'libras-translator/components';

// Autônomo (texto via prop):
<LibrasAvatarFloating text={lastDoctorPhrase} speed={1.3} />

// Imperativo (qualquer pipeline de texto):
const avatarRef = useRef(null);

<LibrasAvatarFloating
  onReady={(api) => { avatarRef.current = api; }}
  initialPosition={{ bottom: 24, right: 24 }}
  width={200}
  height={260}
/>

// Conectar ao pipeline:
avatarRef.current?.translate('Boa tarde, como você está?');
```

#### `LibrasTranslatorPanel` — uso

```tsx
import { LibrasTranslatorPanel } from 'libras-translator/components';

// Aba retrátil à direita, gerenciamento interno:
<LibrasTranslatorPanel
  side="right"
  width={320}
  tabLabel="Libras"
  audio={{ kind: 'microphone' }}
  showCaptions
/>
```

#### `LibrasAvatarPiP` — uso

```tsx
import { LibrasAvatarPiP } from 'libras-translator/components';

const videoRef = useRef(null);

<div className="call-layout">
  <video ref={videoRef} autoPlay playsInline />
  <LibrasAvatarPiP
    videoRef={videoRef}
    anchor="bottom-left"
    widthPercent={28}
    onReady={(api) => { speechPipeline.onPhrase = api.translate; }}
  />
</div>
```

#### Customização de tema

```css
/* Sobrescrever tokens por escopo — sem !important */
.meu-app .libras-chat-bottom-sheet {
  --lbs-color-bg: #1e1e1e;
  --lbs-color-text: #f5f5f5;
  --lbs-color-accent: #90caf9;
  --lbs-radius-lg: 8px;
}
```

---

### Doc — Escopo 5: Instalação como lib npm

#### Instalação

```bash
npm install libras-translator
```

React ≥ 18 é peerDependency.

#### Configuração inicial

```tsx
// main.tsx
import 'libras-translator/style.css';
```

#### Snippet mínimo

```tsx
import 'libras-translator/style.css';
import { LibrasTranslator } from 'libras-translator';

function App() {
  return <LibrasTranslator audio={{ kind: 'microphone' }} style={{ height: 400 }} />;
}
```

#### Assets do VLibras (self-hosted opcional)

```tsx
<LibrasTranslator
  audio={{ kind: 'microphone' }}
  vlibras={{
    bundleUrl: '/assets/vlibras/vlibras.js',
    targetPath: '/assets/vlibras/target',
    translatorUrl: '/api/vlibras-translate',
  }}
/>
```

#### Compatibilidade de navegadores

| Recurso | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Avatar VLibras (WebGL) | ✓ | ✓ | ✓ | ✓ |
| Web Speech API | ✓ | ✗ | Parcial | ✓ |
| Deepgram/AssemblyAI/Azure | ✓ | ✓ | ✓ | ✓ |
| MediaRecorder opus | ✓ | ✓ | ✓ 17+ | ✓ |

---

## 4. Roadmap sugerido

| Ordem | Escopo | Esforço | Justificativa |
|-------|--------|---------|---------------|
| 1 | E1 — Velocidade | 1–2 dias | Pequena, alto valor perceptível, valida o ciclo de dev. |
| 2 | E2 — ASR agnóstico | 3–5 dias | Fundação arquitetural — todos os outros escopos dependem do contrato `ASRFactory`. |
| 3 | E3 — Adapters de videochamada | 5–8 dias | Daily.co e Twilio primeiro; Zoom por último (maior complexidade). |
| 4 | E4 — LibrasChat plugável | 3–4 dias | Melhora o produto principal; os CSS tokens alimentam o E6. |
| 5 | E6a — Infra de componentes | 2–3 dias | Entry point `/components`, tokens.css, `LibrasAvatarFloating`, `LibrasAvatarPiP`. |
| 6 | E6b — `LibrasChatBottomSheet` + Panel | 3–4 dias | Componente central do produto; usa tudo que veio antes. |
| 7 | E5 — Publicação ESM | 2–3 dias | Release final após a superfície pública estar completa. |

### Calendário de implementação (7 semanas)

```
Semana 1 — E1: Velocidade
  - Testar setSpeed no console do demo                        [investigação]
  - Props minSpeed/maxSpeed/speedStep em LibrasTranslator     [E1]
  - Controle de velocidade no LibrasChat lado cliente         [E1]
  - Teste unitário setSpeed com FakePlayer                    [E1]

Semana 2 — E2: ASR agnóstico
  - Refatorar ASROptions para { provider: 'webspeech' | 'custom' }
  - Mover DeepgramASR para providers/deepgram.ts
  - Criar providers/assemblyai.ts, providers/azure.ts
  - Criar providers/google.ts (REST, sem SDK)
  - Testes: injeção de CloudASR mock

Semana 3 — E3: Adapters de videochamada
  - Adapter Daily.co + watchDailyParticipant                  [baixa complexidade]
  - Adapter Twilio                                            [baixa complexidade]
  - Adapter Jitsi                                             [média complexidade]

Semana 4 — E3 + E4
  - Adapter Zoom (AudioContext bridge)                        [alta complexidade]
  - CSS custom properties + videoSlot no LibrasChat           [E4]
  - Callbacks onSignStart/onSignEnd + renderMessage           [E4]
  - roleConfig e timestamp em LibrasChatMessage               [E4]

Semana 5 — E6a: Infraestrutura de componentes
  - Entry point /components no package.json
  - tokens.css + estrutura de pastas
  - LibrasAvatarFloating (mais simples, valida infra)
  - LibrasAvatarPiP

Semana 6 — E6b: Componentes principais
  - LibrasChatBottomSheet (portal, animação CSS, drag handle)
  - LibrasTranslatorPanel (drawer retrátil)
  - Exemplos no demo: Vonage, Daily.co, genérico (microfone)

Semana 7 — E5: Publicação ESM
  - Corrigir package.json (sideEffects, exports CSS, /providers/*)
  - Remover getLibrasEnv do bundle público
  - CI GitHub Actions (typecheck + testes)
  - Testar npm pack em app Vite virgem
  - Release 1.0 via Changesets
```

### Dependências entre escopos

```
E2 (ASRFactory) → E3, E4, E6 (todos usam ASROptions estável)
E4 (CSS tokens LibrasChat) → E6 (tokens herdados pelos componentes)
E6a (infra) → E6b (LibrasChatBottomSheet)
E6b → E5 (release só após superfície pública completa)
E1 → independente, pode começar imediatamente
```

---

## Pontos de atenção

1. **`setSpeed` no player real**: antes de codificar o controle completo, testar `window.VLibras.playerInstance?.setSpeed?.(2)` no console do demo. Se o player não responder, implementar a UI de qualquer forma mas documentar como known limitation.

2. **Chaves de API no cliente**: Deepgram e AssemblyAI foram projetados para uso server-side. Em produção, o padrão correto é um proxy no backend que gera tokens temporários. Os providers da lib não devem encorajar `apiKey` hardcoded em apps públicos — documentar o padrão de proxy.

3. **Zoom bridge**: `AudioContext.createMediaElementSource()` introduz latência ~50ms. Validar impacto na qualidade do ASR antes de publicar o adapter.

4. **CSS e tree-shaking**: `"sideEffects": ["**/*.css"]` garante que bundlers não descartam o CSS. O entry point `/components` é tree-shaken independente do entry point raiz.

5. **Singleton WebGL**: `LibrasAvatarFloating` e `LibrasChatBottomSheet` na mesma página dividem o mesmo singleton do player via `useLibrasAvatar` — garantido pelo design atual. Não instanciar dois `LibrasTranslator` independentes na mesma página.
