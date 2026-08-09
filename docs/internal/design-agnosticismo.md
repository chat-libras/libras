# Análise de Agnosticismo e Customização — libras-translator

## 1. Mapa de Agnosticismo Atual

| Dimensão | Estado Atual | Gap Real | Prioridade |
|---|---|---|---|
| Renderizador do avatar | `SignRenderer` interface existe; hook vaza tipo concreto `VLibrasSignRenderer` | Hook não aceita renderer injetado | Alta |
| Tradução PT→glosa | `translatorUrl` configurável no player; `LibrasObserver` chama `fetch` diretamente | Dois pontos independentes acoplados ao endpoint VLibras; sem interface `Translator` | Alta |
| ASR | `ASROptions` é union fechada `'webspeech' \| 'deepgram'` | Extensão viola OCP; sem tipo normalizado de resultado | Média |
| Transporte de mensagens | `LibrasChat` recebe `messages`/`onSend` — bom design | Sem contrato formal `ChatTransport` | Baixa-Média |
| Estilo e tema | CSS plano com cores hardcoded (`#a60`, `crimson`) | Sem CSS custom properties | Alta |
| Componentes headless | Hooks já são headless; componentes misturam lógica e HTML | Consumidor não pode trazer design system próprio sem fork | Média |
| i18n | `LibrasChat.labels` externaliza nomes de papel; demais strings hardcoded | Strings espalhadas em 4+ componentes sem contrato único | Média |
| Acessibilidade | Sem `aria-*`, sem `prefers-reduced-motion`, sem foco gerenciado | Zero configuração de a11y exposta ao consumidor | Baixa-Média |
| Eventos/observabilidade | `onReady`, `onTranscript` existem; sem ciclo de vida unificado | Sem evento de "frase sinalizada", "fila vazia", "idle" | Baixa |
| Configuração global | Props repetidas (`vlibras`, `asr`, `audio`) em toda a árvore | Sem Context provider | Alta (ergonomia) |

---

## 2. Opções por Dimensão

---

### 2.1 Renderizador do Avatar

**Problema:** `useLibrasAvatar` instancia `VLibrasSignRenderer` diretamente e vaza o tipo concreto no retorno (`renderer: VLibrasSignRenderer | null` em vez de `SignRenderer | null`).

**Opção A — Injeção de renderer via factory (recomendada para v1.0)**

```typescript
// core/avatar-renderer.ts
export interface AvatarRenderer extends SignRenderer {
  mount(container: HTMLElement): Promise<void>;
  unmount(): void;
}

export type AvatarRendererFactory = (options: unknown) => AvatarRenderer;

// ui/useLibrasAvatar.ts
export interface UseLibrasAvatarOptions {
  vlibras?: VLibrasLoaderOptions;
  rendererFactory?: AvatarRendererFactory; // NOVO — default: VLibrasAvatarRenderer
  speed?: number;
  onReady?: () => void;
}
```

Consumidor que quer avatar SVG próprio implementa `AvatarRenderer` e passa o factory. **Zero breaking change.**

**Opção B — Renderizador como componente React (headless)**

Remove o DOM do hook — só expõe `translate()`, `status`, etc. Máxima liberdade, mas destrói o caso de uso principal. Só faz sentido como produto paralelo (`useLibrasSignalBus`).

**Opção C — Monorepo separado**

`@libras/core` + `@libras/vlibras` + `@libras/react`. Over-engineering até ter 2+ renderizadores em produção.

**Recomendação:** Opção A agora. Corrigir o vazamento de tipo (`renderer: SignRenderer | null`) é zero custo — é um bug de abstração. O factory é opt-in.

---

### 2.2 Motor de Tradução PT→Glosa

**Problema:** Dois acoplamentos independentes:
1. `vlibras-loader.ts`: passa `translatorUrl` ao Player (que chama internamente)
2. `libras-observer.ts`: chama `fetch(translatorUrl)` diretamente para prefetch de glosa

**Opção A — Interface `GlosaTranslator` injetável (recomendada)**

```typescript
// core/glosa-translator.ts
export interface GlosaTranslator {
  translate(text: string): Promise<string>;
  cancel?(): void;
}

// Implementação padrão (o que existe hoje):
export function createVLibrasTranslator(url?: string): GlosaTranslator {
  const endpoint = url ?? 'https://traducao2.vlibras.gov.br/translate';
  return {
    async translate(text) {
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.text();
    },
  };
}
```

`LibrasObserver` passa a receber `GlosaTranslator` no construtor em vez de uma URL.

**Opção B — Tradução como middleware no pipeline**

```typescript
export interface SignPipeline {
  translator?: GlosaTranslator; // opcional — renderer que entende PT diretamente não precisa
  renderer: SignRenderer;
}
```

Mais elegante; torna a tradução opcional. Redesign maior — candidato a v2.0.

**Recomendação:** Opção A para o `LibrasObserver` (é um bug de design). Para o player VLibras, `translatorUrl` já é suficiente para v1.0.

---

### 2.3 ASR — Melhorias além do `ASRFactory`

**Problema:** `ASROptions` é union fechada; adicionar provider exige modificar o core.

**Opção A — ASR como objeto injetável direto (recomendada)**

```typescript
// Tipo normalizado de resultado:
export interface ASRResult {
  text: string;
  isFinal: boolean;
  confidence?: number;
  offsetMs?: number;
}

// ASROptions aceita objeto diretamente além da string:
export type ASROptions =
  | { provider: 'webspeech'; lang?: string }
  | { provider: 'deepgram'; apiKey: string; lang?: string }
  | { provider: ASRProvider }; // NOVO: objeto direto, sem string discriminante
```

Consumidor com AssemblyAI:
```typescript
import { createAssemblyASR } from './my-assembly-asr';

<LibrasTranslator
  asr={{ provider: createAssemblyASR({ apiKey: '...' }) }}
/>
```

**Recomendação:** Opção A como adição aditiva (sem breaking change). `ASRResult` normalizado internamente desde já — útil para legendas e analytics.

---

### 2.4 Transporte de Mensagens no Chat

**Opção A — Interface `ChatTransport` com adapters prontos**

```typescript
// core/chat-transport.ts
export interface ChatTransport {
  send(text: string): void;
  onReceive(handler: (msg: LibrasChatMessage) => void): () => void; // retorna unsubscribe
}

// adapters/vonage.ts — adapter pronto:
export function createVonageTransport(session: VonageSessionLike, myRole: LibrasChatRole): ChatTransport {
  return {
    send(text) {
      session.signal({ type: 'chat', data: JSON.stringify({ text, from: myRole }) });
    },
    onReceive(handler) {
      const listener = (event: { data: string }) => {
        const msg = JSON.parse(event.data);
        handler({ ...msg, id: crypto.randomUUID() });
      };
      session.on('signal:chat', listener);
      return () => session.off('signal:chat', listener);
    },
  };
}
```

**Opção B — Hook `useChatTransport` (recomendada para v1.0)**

```typescript
const { messages, onSend } = useChatTransport(transport);
<LibrasChat messages={messages} onSend={onSend} role="doctor" />
```

Composição explícita. O app entende o que acontece. Sem alterar `LibrasChatProps`.

**Recomendação:** Opção B se houver demanda. O design atual (props controladas) não é um bug — é uma escolha deliberada. Não forçar a abstração sem consumidor real.

---

### 2.5 Estilo e Tema

**Problema:** Cores e fonte hardcoded no CSS (`#a60`, `crimson`, `system-ui`). Consumidor precisa sobrescrever por especificidade.

**Opção A — CSS Custom Properties com namespace (recomendada — fazer agora)**

```css
/* Refatorar os 5 arquivos CSS existentes para usar variáveis: */
:root {
  --libras-font: system-ui, sans-serif;
  --libras-color-interim: #a60;
  --libras-color-error: crimson;
  --libras-avatar-bg: #000;
  --libras-bubble-bg-mine: #d1e7ff;
  --libras-bubble-bg-other: #f0f0f0;
  --libras-radius: 8px;
}
```

Zero breaking change. Funciona com qualquer framework CSS.

**Opção B — `classNames` por slot**

```typescript
export interface LibrasTranslatorProps {
  classNames?: {
    stage?: string;
    caption?: string;
    controls?: string;
    overlay?: string;
  };
}
```

Complementa a Opção A. Permite CSS Modules e Tailwind sem conflito de especificidade.

**Opção C — Componentes headless (sem CSS próprio)**

Só faz sentido como camada paralela, não como substituição dos componentes prontos.

**Recomendação:** Opção A imediatamente (mudança de 30min). Impossível retrofit sem breaking change depois. Opção B como complemento.

---

### 2.6 Componentes Headless

**Opção A — Exportar hooks como primitivas headless (recomendada para v1.0)**

```typescript
// Os hooks já existem e são headless — garantir que são exportados com API estável:
export function useLibrasChat(options: UseLibrasChatOptions) {
  const avatar = useLibrasAvatar(options);
  const speech = useDoctorSpeech(options.audio, options.asr, options.onPhrase);
  return { avatar, speech };
}

// O componente "batteries included" usa os hooks internamente:
export function LibrasChat(props: LibrasChatProps) { /* usa useLibrasChat */ }
```

**Opção B — Compound components**

```tsx
<LibrasChat.Root role="doctor" messages={msgs} onSend={send}>
  <LibrasChat.Avatar />
  <LibrasChat.Log />
  <LibrasChat.Form />
  <LibrasChat.MicButton />
</LibrasChat.Root>
```

Elegante e composível. Complexidade de implementação moderada. Candidato a v2.0.

**Recomendação:** Opção A (exportar `useLibrasChat`) para v1.0. Compound components só após feedback real de consumidores com design systems próprios.

---

### 2.7 i18n

**Strings hardcoded encontradas no código:**

| Arquivo | Strings |
|---|---|
| `SendForm.tsx:21` | `"Enviar"` |
| `DoctorSide.tsx:18` | `"Escrever para o cliente…"`, `"⏹ Parar"`, `"🎤 Falar"` |
| `ClientSide.tsx:30,35` | `"Carregando avatar…"`, `"Responder ao médico…"` |
| `LibrasTranslator.tsx:91,94,104,107,110` | `"Digitar frase…"`, `"Traduzir texto"`, `"⏹ Parar"`, `"▶ Traduzir"`, `"Ajustar a velocidade do avatar"` |

**Opção A — Dict de strings como prop (recomendada — fazer agora)**

```typescript
// ui/strings.ts
export interface LibrasStrings {
  avatarLoading?: string;         // "Carregando avatar…"
  captionPlaceholder?: string;    // "Digitar frase…"
  buttonTranslate?: string;       // "▶ Traduzir"
  buttonStop?: string;            // "⏹ Parar"
  buttonSubmitText?: string;      // "Traduzir texto"
  buttonSpeedLabel?: string;      // "Ajustar a velocidade do avatar"
  chatSendButton?: string;        // "Enviar"
  chatDoctorPlaceholder?: string; // "Escrever para o cliente…"
  chatClientPlaceholder?: string; // "Responder ao médico…"
  chatMicStart?: string;          // "🎤 Falar"
  chatMicStop?: string;           // "⏹ Parar"
}

export const DEFAULT_STRINGS: Required<LibrasStrings> = { /* valores atuais */ };
```

Cada componente recebe `strings?: LibrasStrings` e usa `{ ...DEFAULT_STRINGS, ...strings }`. Sem drilling excessivo — a prop desce naturalmente.

**Recomendação:** Opção A agora. Refatoração de 2–3h. Impossível retrofit depois sem breaking change.

---

### 2.8 Acessibilidade

**Problemas encontrados:** sem `aria-*`, sem `prefers-reduced-motion`, sem foco gerenciado.

**Opção A — Props de a11y mínimas (recomendada para v1.0)**

```typescript
export interface A11yOptions {
  avatarLabel?: string;            // aria-label do container. Default: "Avatar de Libras"
  respectReducedMotion?: boolean;  // desativa animações de loading. Default: true
}
```

Aplicações mínimas:
```tsx
<div ref={containerRef} role="img" aria-label={a11y?.avatarLabel ?? 'Avatar de Libras'} />
// botões: aria-pressed (microfone ligado/desligado)
// captions: aria-live="polite"
```

```css
@media (prefers-reduced-motion: reduce) {
  .libras-translator__overlay { transition: none; }
}
```

**Opção B — Hook `useA11yPreferences`**

```typescript
export function useA11yPreferences() {
  return {
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    highContrast: window.matchMedia('(forced-colors: active)').matches,
  };
}
```

Near-zero custo. Útil para consumidores que adaptam comportamento fora da lib.

**Recomendação:** Opção A com foco nos controles e áreas de texto (impacto real de a11y). O VLibras/WebGL não é acessível de qualquer forma — focar em `aria-live` nas captions e `aria-pressed` nos botões.

---

### 2.9 Eventos e Observabilidade

**Problema:** Callbacks isolados em pontos diferentes. Zero eventos de ciclo de vida do avatar.

**Opção A — Objeto `events` com callbacks tipados (recomendada)**

```typescript
// core/libras-events.ts
export interface LibrasEvents {
  onReady?: () => void;
  onPhraseQueued?: (text: string) => void;
  onSignStart?: (text: string) => void;
  onSignEnd?: (text: string) => void;
  onIdle?: () => void;             // fila esvaziou, avatar ficou idle
  onTranscript?: (text: string) => void;
  onInterim?: (text: string) => void;
  onError?: (source: 'asr' | 'avatar' | 'translator', message: string) => void;
}
```

`useLibrasTranslator` aceita `events?: LibrasEvents`. `onSignStart`/`onSignEnd` mapeiam para `'animation:end'` do player VLibras.

**Recomendação:** Opção A para v1.0. Implementação de `onSignStart`/`onSignEnd` requer expor eventos do player ao `VLibrasSignRenderer` — o hook já está próximo disso. Sem dependência nova.

---

### 2.10 Configuração Global

**Problema:** `vlibras`, `asr`, `audio`, `strings`, `a11y` repetidos em todos os componentes.

**Opção A — Context provider com defaults sobrescrevíveis (recomendada para v1.0)**

```typescript
// ui/LibrasProvider.tsx
export interface LibrasConfig {
  vlibras?: VLibrasLoaderOptions;
  asr?: ASROptions;
  audio?: AudioSource;
  events?: LibrasEvents;
  strings?: LibrasStrings;
  a11y?: A11yOptions;
}

export function LibrasProvider({ config, children }: { config: LibrasConfig; children: React.ReactNode }) {
  return <LibrasContext.Provider value={config}>{children}</LibrasContext.Provider>;
}
```

Dentro dos hooks, o Context serve como default; props locais sobrescrevem:

```typescript
// useLibrasAvatar.ts
const ctx = useLibrasConfig();
const vlibras = options.vlibras ?? ctx.vlibras;
```

Uso no app:

```tsx
<LibrasProvider config={{
  vlibras: { targetPath: '/vlibras/target', avatar: 'hozana' },
  asr: { provider: 'deepgram', apiKey: KEY },
  strings: { chatSendButton: 'Send' },
  events: { onError: (src, msg) => Sentry.captureMessage(`[${src}] ${msg}`) },
}}>
  <App />
</LibrasProvider>
```

**Opção B — Config estática (singleton)**

```typescript
export function configureLibras(config: LibrasConfig) { /* global */ }
```

Não funciona com múltiplas instâncias em telas diferentes. Sem SSR. Não usar.

**Recomendação:** Opção A para v1.0. Implementação de ~50 linhas. Props explícitas continuam funcionando; Context fornece defaults. Opt-in — quem não usa `LibrasProvider` não perde nada.

---

## 3. Recomendações de Prioridade

### Fazer antes de v1.0 (primeiro consumidor externo)

| O que | Custo | Por quê agora |
|---|---|---|
| CSS Custom Properties (2.5-A) | 1–2h | Impossível retrofit sem breaking change depois |
| `LibrasStrings` externalizadas (2.7-A) | 2–3h | Mesmo motivo — hardcode cresce como dívida |
| Corrigir `renderer: SignRenderer \| null` (2.1) | 30min | Bug de abstração — vazar tipo concreto na API viola DIP |
| `LibrasProvider` com config global (2.10-A) | 2–3h | Ergonomia que consumidores sentem na primeira hora de integração |
| ARIA mínimo nos controles (2.8-A) | 2–3h | `aria-live` nas captions e `aria-pressed` nos botões são obrigações |
| ASR como objeto injetável — branch `{ provider: ASRProvider }` (2.3-A) | 2–4h | Sem isso, qualquer ASR novo exige modificar o core |

### Implementar em v2.0 (após feedback de 2+ consumidores)

| O que | Por quê esperar |
|---|---|
| `AvatarRendererFactory` completo | Nenhum consumidor pediu avatar alternativo ainda |
| `GlosaTranslator` injetável completo | `translatorUrl` cobre o caso 80% |
| Compound components `LibrasChat.Root/.Log/.Form` | Esperar design systems reais chegarem |
| Objeto `events` completo com `onSignStart`/`onSignEnd` | Esperar demanda de analytics real |
| `useChatTransport` + adapters Vonage/Daily | Esperar segundo adaptador de plataforma |

### Nunca fazer (over-engineering)

- Monorepo de pacotes separados antes de 2+ renderizadores em produção
- Renderizador como componente React como *substituição* do atual
- i18n com interpolação e pluralização (a lib não tem frases com variáveis)
- EventEmitter/mitt — callbacks tipados cobrem todos os casos sem dependência
- Config estática singleton (`configureLibras`) — Context React é superior em tudo

---

## 4. Princípios de Design

**1. Aditivo antes de substitutivo.**
Toda extensão de API deve ser opt-in. Consumidores existentes não migram forçados. Mudança que quebra API pública = candidata a v2.0 com semver.

**2. Interfaces no limite público; concreto internamente.**
`SignRenderer`, `GlosaTranslator`, `ASRProvider`, `ChatTransport` — o consumidor vê interfaces. `VLibrasSignRenderer`, `DeepgramASR`, `createVLibrasPlayer` — detalhes que mudam sem breaking change.

**3. O hook é a primitiva; o componente é o atalho.**
`useLibrasTranslator` deve ser suficiente para qualquer caso de uso. `<LibrasTranslator>` existe para o caso 80%. Nunca colocar lógica no componente que não está no hook.

**4. Zero dependências de runtime na API pública.**
Os adapters usam tipagem estrutural — nunca importam SDKs de plataforma. A lib nunca causa conflito de versão com o SDK que o consumidor já usa.

**5. Configuração por composição, não por mágica.**
Preferir props explícitas, factories injetáveis e Context opt-in. Quando algo não funciona, o consumidor entende lendo os tipos — não lendo o código-fonte da lib.

**6. Erros devem dispensar o Google.**
`'Web Speech API só ouve o microfone. Para áudio de chamada, use um provedor de nuvem.'` — este é o padrão. Erros vagos (`'ASR error'`) são bugs de developer experience.

**7. Testabilidade como critério de design.**
Se uma unidade não é testável sem DOM ou sem WebGL, a interface está errada. `GlosaTranslator`, `ASRProvider` e `AvatarRenderer` devem ser testáveis com fakes injetados, sem rede.
