# /react-clean — Boas Práticas React + Clean Code

Analise o código passado como argumento (ou os arquivos mencionados no contexto) e aplique/sugira correções baseadas nas regras abaixo, específicas para este projeto.

**Se o usuário passar um arquivo ou trecho:** leia-o, identifique violações e aplique as correções diretamente.
**Se não houver argumento:** liste as regras e pergunte qual área do código revisar.

---

## Regras deste projeto

### 1. Nomenclatura

| Elemento | Padrão | Exemplo correto |
|----------|--------|-----------------|
| Hook | `use` + PascalCase | `useLibrasAvatar`, `useClientSignaling` |
| Componente | PascalCase | `LibrasChat`, `SendForm` |
| Props interface | Nome do componente + `Props` | `LibrasChatProps`, `SendFormProps` |
| Hook options | Nome do hook sem `use` + `Options` | `UseLibrasAvatarOptions` |
| Hook return type | Nome do hook sem `use` + `Api` | `LibrasAvatarApi` |
| Adapter/util function | camelCase descritivo | `audioStreamFromTrack`, `createCaptionSink` |

**Violação comum:** sufixo genérico (`IProps`, `TOptions`) ou ausência de interface para props.

---

### 2. Single Responsibility em hooks

Cada hook deve ter uma única razão para mudar. O modelo do projeto:

```
useLibrasAvatar    ← só monta o avatar e expõe translate()
    ↑ composto por
useLibrasTranslator ← acrescenta ASR (áudio → texto)
```

**Não misturar:** captura de áudio + sinalização + estado de UI no mesmo hook. Se um hook crescer além de ~80 linhas de lógica, decompor.

---

### 3. Separação core / ui

- **`src/libras/core/`** → zero imports de React, zero imports de `adapters/`. Lógica pura, testável com `FakePlayer`.
- **`src/libras/ui/`** → pode importar `core/`; não importa `adapters/`.
- **`src/libras/adapters/`** → pode importar `core/`; não importa `ui/`.

**Checagem rápida:**
```bash
grep -r "from 'react'" src/libras/core/     # deve retornar vazio
grep -r "from '../adapters'" src/libras/ui/ # deve retornar vazio
```

---

### 4. Props explícitas via interface

Toda prop deve ter interface tipada em `src/libras/ui/interfaces/`. Nunca usar `any` ou objeto inline sem type.

```ts
// ✗ evitar
function MyComponent({ onSend, labels }: any) {}

// ✓ correto
interface MyComponentProps {
  onSend: (text: string) => void
  labels: Record<LibrasChatRole, string>
}
function MyComponent({ onSend, labels }: MyComponentProps) {}
```

Preferir `type` para props/opções simples; `interface` quando outros módulos precisam implementar o contrato (ex.: `SignRenderer`, `VLibrasPlayerLike`).

---

### 5. useEffect: cleanup e dependências

Todo `useEffect` que cria recursos deve limpá-los. Modelo do projeto (`useLibrasAvatar.ts`):

```ts
useEffect(() => {
  let disposed = false          // guard contra efeitos cancelados

  asyncOperation().then((result) => {
    if (disposed) return        // ignora se desmontado
    // usa result...
  })

  return () => { disposed = true }  // cleanup obrigatório
}, [])  // dependências explícitas — não omitir
```

**Singletons** (`rendererSingleton`, `playerPromise`) existem fora do React e **não são limpos no unmount** — isso é intencional (Unity não pode ser recriado). Não adicionar limpeza desses singletons no cleanup do efeito.

---

### 6. Comentários: só o não-óbvio

Comentar apenas:
- Invariantes que não aparecem nos tipos (ex.: "O Unity não pode ser instanciado 2×")
- Workarounds para bugs de bibliotecas externas
- Comportamentos surpreendentes do player do VLibras (ex.: `settleMs` para eventos espúrios)

**Não comentar** o que o nome já diz:
```ts
// ✗ desnecessário
// Retorna o texto traduzido
function translate(text: string) { ... }

// ✓ necessário
// settleMs: o player emite animation:end espúrio ao chamar stop() internamente.
// Ignoramos eventos logo após translate() para evitar avançar a fila cedo.
```

---

### 7. Estado mínimo

Não duplicar estado que pode ser derivado. Exemplos do projeto:
- `status: 'loading' | 'ready' | 'error'` → derivado de `player` + `error`, não armazenado separado.
- Velocidade do renderer → `rendererSingleton.setSpeed(value)` + `setSpeedState(value)` em sincronia.

Se encontrar `useState` cujo valor é sempre igual a outro estado transformado, substituir por `useMemo` ou cálculo inline.

---

### 8. Sem prop drilling além de 2 níveis

`LibrasChat` → `ClientSide` → `useLibrasAvatar`: aceitável (3 níveis com lógica em cada).
Se uma prop passar por 3+ componentes sem ser usada no intermediário, extrair em hook ou context.

---

### 9. Composed (Compound) Pattern

Componentes monolíticos com dezenas de props booleanas são um sinal de alarme. Preferir o padrão **Compound Components**: divida em peças menores que cooperam via `children` ou subestruturas nomeadas.

```tsx
// ✗ evitar — booleanos acumulados, difícil de estender
<ChatPanel
  showHeader
  headerTitle="Libras"
  showFooter
  footerText="Enviar"
  onSend={handleSend}
/>

// ✓ correto — composed pattern com sub-componentes
<ChatPanel>
  <ChatPanel.Header>Libras</ChatPanel.Header>
  <ChatPanel.Body messages={messages} />
  <ChatPanel.Footer onSend={handleSend} />
</ChatPanel>
```

**Implementação padrão do projeto:**
```tsx
function ChatPanel({ children }: ChatPanelProps) {
  return <div className="chat-panel">{children}</div>
}
ChatPanel.Header = ChatPanelHeader
ChatPanel.Body   = ChatPanelBody
ChatPanel.Footer = ChatPanelFooter
export { ChatPanel }
```

**Quando usar Context interno** (estado compartilhado entre sub-componentes sem prop drilling):
```tsx
const ChatPanelCtx = createContext<ChatPanelCtxValue | null>(null)

function useChatPanelCtx() {
  const ctx = useContext(ChatPanelCtx)
  if (!ctx) throw new Error('useChatPanelCtx must be used inside <ChatPanel>')
  return ctx
}
```

---

### 10. Componentes reutilizáveis

Regras para que um componente possa ser reaproveitado em contextos diferentes:

1. **Aceita `className` e `style`** — nunca hardcode cores ou espaçamento que o consumidor não pode sobrescrever.
2. **Expõe `children`** quando a área de conteúdo é variável — evita props `content`, `body`, `slot`.
3. **Prop `as` para semântica polimórfica** quando o elemento HTML importa (ex.: botão que às vezes é `<a>`):

```tsx
type ButtonProps<T extends ElementType = 'button'> = {
  as?: T
} & ComponentPropsWithoutRef<T>

function Button<T extends ElementType = 'button'>({
  as,
  className,
  ...props
}: ButtonProps<T>) {
  const Tag = as ?? 'button'
  return <Tag className={clsx('btn', className)} {...props} />
}
```

4. **Sem decisões visuais fixas** — não hardcode `z-index`, `position: fixed`, ou breakpoints em componentes de UI genéricos; exponha via props ou CSS custom properties.
5. **Forward ref quando necessário** — componentes folha que envolvem elementos DOM nativos devem usar `forwardRef` para que o consumidor acesse a ref.

```tsx
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={clsx('input', className)} {...props} />
  )
)
Input.displayName = 'Input'
```

---

### 11. Componentes escaláveis

**Colocação de estado:** mantenha o estado o mais próximo possível de onde é usado. Só eleve (lift up) quando dois irmãos precisam do mesmo dado.

**Feature folders:** ao crescer, agrupar por feature, não por tipo de arquivo:
```
src/libras/ui/
  chat/
    LibrasChat.tsx       ← componente raiz
    ChatBody.tsx
    ChatFooter.tsx
    useChat.ts           ← lógica específica de chat
    chat.types.ts
    index.ts             ← barrel export público
  avatar/
    LibrasAvatar.tsx
    useLibrasAvatar.ts
    index.ts
```

**Barrel exports controlados:** `index.ts` de cada feature expõe apenas o contrato público. Imports internos cruzando features só via `index.ts`, nunca direto ao arquivo.

**Lazy loading para features pesadas** (ex.: o player Unity):
```tsx
const LibrasAvatar = lazy(() => import('./avatar/LibrasAvatar'))

function LibrasChat() {
  return (
    <Suspense fallback={<AvatarSkeleton />}>
      <LibrasAvatar />
    </Suspense>
  )
}
```

---

### 12. Performance: quando (e quando não) otimizar

**Não usar `memo`, `useCallback`, `useMemo` por padrão.** Só otimizar quando há evidência de re-render custoso.

| Ferramenta | Quando usar |
|------------|-------------|
| `React.memo` | Componente filho com props estáveis e render caro (ex.: lista longa) |
| `useCallback` | Função passada como dep de `useEffect` ou prop de componente memoizado |
| `useMemo` | Cálculo computacionalmente caro (>1ms), não apenas "evitar re-criar objeto" |

**Regra prática:** profile antes de memoizar. Re-renders baratos são inofensivos; complexidade de memoização não é.

---

### 13. Acessibilidade (a11y) básica

Todo componente interativo deve:
- Ter rótulo acessível (`aria-label`, `aria-labelledby`, ou `<label>` associado)
- Ser operável via teclado (`onKeyDown` com `Enter`/`Space` quando necessário)
- Usar elementos semânticos corretos (`<button>` para ação, `<a>` para navegação)
- Anunciar mudanças dinâmicas com `aria-live` quando conteúdo muda sem troca de foco (ex.: mensagens do chat)

```tsx
// ✗ evitar
<div onClick={handleSend}>Enviar</div>

// ✓ correto
<button type="button" onClick={handleSend} aria-label="Enviar mensagem">
  Enviar
</button>
```

---

### 14. API design de componentes (contrato estável)

- **Callbacks nomeados `on<Evento>`** — `onSend`, `onClose`, `onStatusChange`.
- **Nunca retornar JSX de um hook** — hooks retornam dados e funções; componentes retornam JSX.
- **Render Props apenas quando `children` como função for a única saída** — prefira hooks customizados.
- **`defaultProps` via default parameters**, não via `Component.defaultProps` (deprecated no React 19).
- **Versionamento de API**: quando alterar assinatura de um componente público, manter compatibilidade ou criar variante com nome distinto.

```ts
// ✗ defaultProps deprecated
MyComponent.defaultProps = { speed: 1 }

// ✓ default parameter
function MyComponent({ speed = 1 }: MyComponentProps) { ... }
```

---

## Checklist rápido antes de um PR

- [ ] Nomes seguem os padrões da tabela acima
- [ ] Nenhum import de React em `core/`
- [ ] Todo `useEffect` tem array de dependências e cleanup
- [ ] Props tipadas em interface própria, sem `any`
- [ ] Comentários explicam o **porquê**, não o **o quê**
- [ ] Novos testes em `src/test/` (não dentro das pastas de código)
- [ ] Componentes grandes decompostos em sub-componentes com responsabilidade única
- [ ] Composed pattern aplicado onde há >3 props booleanas de layout/conteúdo
- [ ] Componentes reutilizáveis aceitam `className`, `children`, e `forwardRef` quando cabe
- [ ] Estado colocado no nível mais baixo possível; context só quando prop drilling > 2 níveis
- [ ] Nenhum `React.memo`/`useCallback`/`useMemo` sem profile que justifique
- [ ] Elementos interativos têm label acessível e suporte a teclado
