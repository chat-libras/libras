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

## Checklist rápido antes de um PR

- [ ] Nomes seguem os padrões da tabela acima
- [ ] Nenhum import de React em `core/`
- [ ] Todo `useEffect` tem array de dependências e cleanup
- [ ] Props tipadas em interface própria
- [ ] Sem `any` explícito
- [ ] Comentários explicam o **porquê**, não o **o quê**
- [ ] Novos testes em `src/test/` (não dentro das pastas de código)
