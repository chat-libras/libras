
# Arquitetura — libras-kit

Documento técnico para uso por modelos de IA ao fazer alterações. Complementa o CLAUDE.md (comandos e visão geral) e o README.md (uso da biblioteca).

---

## Camadas e fronteiras

```
packages/libras-kit/src/libras/
  core/       ← lógica pura; SEM imports de React, SEM imports de adapters
  ui/         ← hooks React + componentes; pode importar de core/, não de adapters/
  adapters/   ← bridges de plataforma; pode importar de core/; NÃO importa de ui/
  index.ts    ← re-exports da API pública

packages/libras-kit/src/test/   ← testes; importam de core/ e ui/ diretamente
examples/demo/                  ← harness de dev; pode importar tudo; nunca é importado pela lib
examples/video-call/            ← videochamada WebRTC real (server + client)
```

**Regra de dependência:** as setas apontam para dentro (`adapters → core`, `ui → core`). Cruzamentos inversos quebram a testabilidade e o isolamento do Unity.

---

## Padrões de design

### DIP — `SignRenderer` (`core/sign-renderer.ts`)

Interface mínima que desacopla o código de sinalização do player concreto:

```ts
interface SignRenderer {
  play(text: string): void
  clear(): void
  setSpeed(speed: number): void
  busy: boolean
  pending: number
}
```

`VLibrasSignRenderer` (`core/vlibras-renderer.ts`) implementa esta interface injetando um `VLibrasPlayerLike` no construtor — por isso os testes usam `FakePlayer` sem nunca carregar o Unity.

### Singleton do player (`core/vlibras-loader.ts`)

```
let playerPromise: Promise<VLibrasPlayerFull> | null = null
```

O Unity/WebGL é pesado e **não pode ser instanciado mais de uma vez**. O `playerPromise` garante isso:
- Primeira chamada: cria o player, armazena a promise, resolve quando o evento `load` dispara.
- Chamadas subsequentes (StrictMode monta 2×, troca de aba remonta componentes): reutiliza a promise e **move** o canvas Unity para o novo container, em vez de criar um novo.

O `rendererRef` vive no React Context (`LibrasRendererContext`), não em módulo global — cada `<LibrasProvider>` isola seu próprio renderer. Fora de um provider, o `globalRendererRef` serve como fallback singleton.

### Queue com backpressure (`core/vlibras-renderer.ts`)

O player do VLibras é **assíncrono e serial**: só sinaliza uma frase por vez e emite `animation:end` ao terminar. Se `translate()` for chamado enquanto o player está ocupado, a animação anterior é interrompida.

A `VLibrasSignRenderer` resolve isso com uma fila + backpressure:

1. `play(text)` empurra na fila; se ocioso, avança imediatamente.
2. O evento `animation:end` dispara `advance()` → próxima frase da fila.
3. Se `queue.length > maxBacklog`, descarta as mais antigas (tempo real: ouvinte não pode esperar frases antigas).
4. `settleMs` (default 250ms em produção, 0 em testes) ignora eventos espúrios logo após `translate()` — o player do VLibras emite um `animation:end` interno ao chamar `stop()`.

---

## Fluxo completo de uma frase até o sinal

```
participante ouvinte fala / escreve
    │
    ▼
<LibrasAvatar> ou useLibrasTranslator
    │ translate(text)
    ▼
VLibrasSignRenderer.play(text)
    │
    ▼
player.translate(text)   [vlibras-loader.ts: window.VLibras.Player]
    │
    ├─► POST https://traducao2.vlibras.gov.br/translate
    │       body: { text, domain }
    │       response: "EU DOR&CABEÇA"  ← glosa (texto puro)
    │
    └─► player.play(glosa)
            │
            └─► GET https://dicionario2.vlibras.gov.br/static/BUNDLES/2018.3.1/WEBGL/BR/<PALAVRA>
                    (um request por token da glosa: CASA, DIA, etc.)
                    response: AssetBundle Unity (~10–50 KB por sinal)
                    → animação 3D do sinal no avatar Ícaro
```

**Fallback de datilologia:** se o `POST /translate` falhar (rede, auth, timeout), o player executa `play(text.toUpperCase())`. Tokens que não existem no dicionário de sinais são soletrando letra a letra. Isso significa:

- **Avatar soletrando TUDO** → problema no tradutor (etapa 1).
- **Avatar soletrando PALAVRAS ESPECÍFICAS** → sinal não existe no dicionário (comportamento normal).

---

## Problema dos hosts `-dth`

O bundle `packages/libras-kit/public/vlibras/vlibras.js` embute as URLs dos serviços do VLibras. Há dois conjuntos de hosts:

| Host | Tradutor | Dicionário |
|------|----------|------------|
| `*-dth.vlibras.gov.br` (legado) | 401 Unauthorized | 200 sem CORS header |
| `*.vlibras.gov.br` (atual) | 200 + CORS ✅ | 200 + CORS ✅ |

As linhas relevantes no bundle:

```js
translatorUrl      = "https://traducao2.vlibras.gov.br/translate"
dictionaryUrl      = "https://dicionario2.vlibras.gov.br/2018.3.1/WEBGL/"
dictionaryStaticUrl = "https://dicionario2.vlibras.gov.br/static/BUNDLES/2018.3.1/WEBGL/"
```

Se um Claude futuro alterar o bundle ou o loader e o avatar voltar a soletrar tudo, a primeira checagem é:
```bash
grep -n 'translatorUrl\|dictionaryUrl' packages/libras-kit/public/vlibras/vlibras.js
# garantir que nenhuma URL contém "-dth"
```

O `DEFAULT_TRANSLATOR_URL` em `vlibras-constants.ts` sobrescreve o `translatorUrl` do bundle via `Player({ translator })`. Self-hosting via Docker usa `/vlibras-translate` (proxy Vite) nesta opção.

---

## ASR plugável (`core/asr/`)

`phrase-source.ts` normaliza dois eixos:

```
AudioSource:  { kind: 'microphone' } | { kind: 'stream', stream: MediaStream }
ASROptions:   { provider: 'webspeech', lang? } | { provider: 'custom', factory: ASRFactory }
```

Regra de escolha automática (em `ui/utils/resolveAsr.ts`):
- `kind: 'microphone'` → sempre `webspeech` (grátis, acessa mic diretamente).
- `kind: 'stream'` → exige `custom` factory (Web Speech API não consegue ouvir MediaStream).

---

## Adapters de plataforma (`adapters/`)

Cada adapter transforma a fonte de áudio da plataforma em um `MediaStream` padrão que o core aceita. Não têm estado próprio; não importam de `ui/`.

| Adapter | Entrada | Saída |
|---------|---------|-------|
| `webrtc.ts` | `<video>` / `MediaStreamTrack` / `RTCPeerConnection` | `MediaStream` |
| `captions.ts` | string (legenda ao vivo) | chama `translate()` diretamente |

O `captions.ts` é diferente: não produz `MediaStream`; em vez disso, expõe um `CaptionSink` que descarta duplicatas em <3s (eco de legenda) e chama `translate(text)` diretamente — útil para plataformas como Teams que expõem legendas mas não o áudio.

---

## Estrutura da UI

### Hierarquia de responsabilidade

```
ui/context/     ← LibrasProvider + contextos (config global + rendererRef isolado)
ui/consts/      ← strings padrão e resolução de overrides
ui/interfaces/  ← tipos TypeScript dos componentes e provider
ui/hooks/       ← useLibrasAvatar (base) + useLibrasTranslator (avatar+ASR)
ui/components/  ← LibrasAvatar (componente único headless)
ui/utils/       ← resolveAsr (escolha de ASR baseada em AudioSource)
```

### Composição de hooks

```
useLibrasAvatar    ← só o avatar (base)
    ↑ compõe
useLibrasTranslator   ← avatar + ASR
    ↑ usado por
LibrasAvatar (componente — showChat: boolean)
```

### Headless: sem CSS padrão

`<LibrasAvatar>` não emite nenhuma classe CSS. O consumidor aplica estilos via:
- `classNames.root`, `classNames.avatar`, `classNames.chat`, `classNames.messages`, `classNames.message`, `classNames.input`
- `styles.*` (mesmo mapa com `React.CSSProperties`)
- Atributos `data-source="speech|typed"` em cada `<li>` de mensagem
