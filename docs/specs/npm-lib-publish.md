# Spec: Publicação como lib npm

**Status:** draft  
**Escopo:** `src/libras/` → `dist/` → `npm publish`

---

## 1. Objetivo

Publicar `libras-translator` no registro npm como uma lib React headless,
tree-shakeable, com tipagem TypeScript completa e sem dependências instáveis.

---

## 2. Estado atual vs. estado-alvo

| Item | Hoje | Alvo |
|---|---|---|
| CSS | ~~importado nos componentes~~ | **headless** (feito) |
| `sideEffects` | ausente | `false` (feito) |
| `react` em `dependencies` | presente (causa dual-React) | **removido** |
| `bundleUrl` padrão | `/vlibras/vlibras.js` (local) | URL jsDelivr com SHA fixo |
| Formato de output | ESM only | **ESM + CJS** |
| `exports` map | parcial | completo com `require` + `types` |
| Metadados do pacote | incompletos | `license`, `repository`, `keywords`, `engines` |
| `prepare` script | ausente | `"prepare": "npm run build"` |
| Release process | manual | **Changesets** |

---

## 3. Mudanças no `package.json`

```json
{
  "name": "libras-translator",
  "version": "0.1.0",
  "description": "Plugin React headless de tradução simultânea Português → Libras.",
  "license": "MIT",
  "author": "chat-libras",
  "repository": {
    "type": "git",
    "url": "https://github.com/chat-libras/libras.git",
    "directory": "."
  },
  "keywords": ["libras", "vlibras", "acessibilidade", "a11y", "react", "avatar"],
  "engines": { "node": ">=18" },

  "type": "module",
  "sideEffects": false,

  "exports": {
    ".": {
      "import":  "./dist/libras-translator.js",
      "require": "./dist/libras-translator.cjs",
      "types":   "./dist/index.d.ts"
    }
  },
  "main":   "./dist/libras-translator.cjs",
  "module": "./dist/libras-translator.js",
  "types":  "./dist/index.d.ts",
  "files":  ["dist", "CHANGELOG.md"],

  "peerDependencies": { "react": ">=18", "react-dom": ">=18" },
  // ← react e react-dom saem de `dependencies` completamente

  "scripts": {
    "prepare": "npm run build"
    // ... demais scripts inalterados
  }
}
```

**Por que remover `react` de `dependencies`:**  
`dependencies` instala uma cópia local de React no `node_modules` da lib.
Se o app do consumidor tem React 18 e a lib instala outro React 18, dois
contextos de hook são criados → erro "Invalid hook call" em runtime.

---

## 4. Mudanças no `vite.config.ts`

### 4.1 Dual output ESM + CJS

```ts
build: {
  lib: {
    entry: 'src/libras/index.ts',
    formats: ['es', 'cjs'],
    fileName: (fmt) => fmt === 'cjs' ? 'libras-translator.cjs' : 'libras-translator.js',
  },
  rollupOptions: {
    external: ['react', 'react/jsx-runtime', 'react-dom'],
  },
  target: 'es2022',
  sourcemap: true,
}
```

CJS é necessário para: Jest (sem transform), Next.js < 13, scripts Node.js.

### 4.2 `vite-plugin-dts` — gerar `.d.ts` único

```ts
dts({
  include: ['src/libras'],
  outDir: 'dist',
  rollupTypes: true,        // um único index.d.ts em vez de espelhar a árvore
  tsconfigPath: './tsconfig.json',
  insertTypesEntry: true,   // garante que o campo "types" do package.json resolve
})
```

---

## 5. Resolução do `bundleUrl` (bloqueador principal)

O loader do VLibras injeta `<script src={bundleUrl}>` no DOM. O padrão atual
aponta para `/vlibras/vlibras.js` (arquivo local), que o consumidor npm não tem.

### Estratégia: jsDelivr com SHA fixo

```ts
// vlibras-loader.ts
const DEFAULT_BUNDLE_URL =
  'https://cdn.jsdelivr.net/gh/spbgovbr-vlibras/vlibras-player-webjs@<SHA>/vlibras.js';
```

**Processo para fixar o SHA:**
1. Localizar o commit mais recente estável no repo
   `spbgovbr-vlibras/vlibras-player-webjs` (branch `sgd` ou `main`)
2. Verificar que o arquivo `vlibras.js` existe naquele SHA via
   `https://cdn.jsdelivr.net/gh/spbgovbr-vlibras/vlibras-player-webjs@<SHA>/vlibras.js`
3. Fixar o SHA (não usar `@main` ou `@latest` — CDNs de branch mudam sem aviso)
4. Documentar o processo de atualização em `docs/vlibras-setup.md`

**Fallback para self-hosting** (já suportado, apenas documentar):
```tsx
<LibrasProvider config={{ vlibras: { bundleUrl: '/vlibras/vlibras.js' } }}>
```

---

## 6. CSS — headless (já implementado)

Nenhum arquivo `.css` é exportado pela lib. Consumidores estilizam via:

| Mecanismo | Exemplo |
|---|---|
| Classe BEM | `.libras-chat__bubble { ... }` |
| `data-role` | `.libras-chat[data-role="sender"] { ... }` |
| `data-from` | `.libras-chat__bubble[data-from="receiver"] { ... }` |
| `data-mine` | `.libras-chat__bubble[data-mine="true"] { align-self: flex-end }` |
| `data-active` | `.libras-chat__mic[data-active="true"] { background: red }` |
| `data-status` | `.libras-chat__status[data-status="error"] { color: crimson }` |
| `aria-pressed` | `.libras-chat__mic[aria-pressed="true"] { ... }` |
| `className` prop | `<LibrasChat className="meu-chat" />` |

Tema de referência: `examples/demo/src/libras-default-theme.css`

---

## 7. Segurança

### 7.1 Injeção dinâmica de script (`ensureBundle`)

A lib injeta um `<script>` no DOM para carregar o player Unity:

```ts
const script = document.createElement('script');
script.src = bundleUrl;  // ← origem controlada pelo consumidor
document.head.appendChild(script);
```

**Riscos e mitigações:**

| Risco | Mitigação |
|---|---|
| `bundleUrl` fornecido por input do usuário | Nunca passar input de usuário como `bundleUrl`. A prop é de configuração estática. |
| CDN comprometida (supply chain) | SHA fixo no jsDelivr (`@<sha>`, não `@main`). Atualizar SHA manualmente após review. |
| CSP bloqueando o script | Documentar que o consumidor precisa adicionar `script-src cdn.jsdelivr.net` na CSP. |

**Regra:** `bundleUrl` e `targetPath` são configuração de build/deploy, nunca dados de runtime vindos de usuários.

### 7.2 `eval` no bundle Unity (fora do controle da lib)

O Unity/WebGL compilado usa `eval` e `new Function`. Consumidores com CSP estrita
precisam adicionar `'unsafe-eval'` ao `script-src`. Documentar claramente no README.

### 7.3 XSS — texto do usuário no chat

O texto das mensagens é renderizado via React JSX (`{m.text}`), que escapa HTML
automaticamente. Não usar `dangerouslySetInnerHTML` em nenhum componente da lib.

**Verificação:**
```bash
grep -r "dangerouslySetInnerHTML" src/libras/   # deve retornar vazio
```

### 7.4 Dados enviados ao tradutor VLibras

O texto do usuário é enviado para `traducao2.vlibras.gov.br/translate` (POST).
Documentar no README que:
- Texto de fala/chat trafega para o servidor externo do gov.br
- Para ambientes com restrição de dados, usar self-hosting (`translatorUrl`)
- Não enviar dados sensíveis (PII, dados clínicos) sem self-hosting configurado

### 7.5 Dependências — surface de ataque

```bash
# verificar vulnerabilidades antes de cada release
npm audit
```

**Regras:**
- Nenhuma dependência em `dependencies` (só `peerDependencies` e `devDependencies`)
- Dependências de dev não entram no bundle (`vite build` as exclui automaticamente)
- Travar versões de dev exatas quando possível (`"vite": "5.4.0"`, não `"^5.4.0"`)

### 7.6 O que NÃO deve entrar no bundle

Verificar após cada build:

```bash
# checar se React entrou no bundle (não deve)
grep -l "createElement" dist/libras-translator.js && echo "ERRO: React no bundle"

# checar se há secrets ou URLs internas
grep -E "(localhost|127\.0\.0\.1|\.env|process\.env)" dist/libras-translator.js
```

---

## 8. Testar o artefato publicado (antes do `npm publish`)

O passo mais importante — os exemplos usam alias para o source, nunca testam o `dist/`.

### 8.1 Smoke test com o dist real

```ts
// examples/demo/vite.config.ts — trocar temporariamente
alias: {
  // 'libras-translator': resolve(__dirname, '../../src/libras/index.ts'),
  'libras-translator': resolve(__dirname, '../../dist/libras-translator.js'),
}
```

Rodar a demo completa com esse alias. Se tudo funciona, o bundle está correto.

### 8.2 `npm pack` — inspecionar o que seria publicado

```bash
npm pack --dry-run
# lista exata de arquivos que vão para o npm

npm pack
tar -tzf libras-translator-0.1.0.tgz
# verificar: só dist/ + CHANGELOG.md + package.json + README.md
# não deve conter: src/, examples/, .env, node_modules/
```

### 8.3 Teste de types em projeto consumidor isolado

```bash
mkdir /tmp/libras-test && cd /tmp/libras-test
npm init -y
npm install react@18 react-dom@18
npm install /caminho/para/libras-translator-0.1.0.tgz

# criar index.tsx e verificar que os tipos resolvem
npx tsc --noEmit
```

---

## 9. Release process (Changesets)

```bash
npm install -D @changesets/cli
npx changeset init
```

**Fluxo:**

```
1. Desenvolvimento em feature branch
2. npx changeset add       → descreve a mudança (patch/minor/major)
3. PR + review
4. Merge em main
5. npx changeset version   → bump automático do package.json + CHANGELOG.md
6. npm run build           → gera dist/
7. npm publish             → publica no npm
```

**Regras de versionamento semântico:**

| Mudança | Versão |
|---|---|
| Bugfix, ajuste interno | patch (0.1.x) |
| Nova prop/hook, backward-compatible | minor (0.x.0) |
| Breaking change em API pública | major (x.0.0) |
| Remover export, mudar assinatura | **major** — sempre |

---

## 10. Checklist pré-publish

```
[ ] react removido de `dependencies`
[ ] bundleUrl padrão aponta para jsDelivr com SHA fixo
[ ] npm run build passa sem erros
[ ] npm run typecheck passa sem erros
[ ] npm test passa (cobertura > 60%)
[ ] Smoke test com dist/ real na demo
[ ] npm pack --dry-run — verificar arquivos incluídos
[ ] grep "dangerouslySetInnerHTML" src/libras/ → vazio
[ ] grep "localhost" dist/ → vazio
[ ] npm audit → sem vulnerabilidades high/critical
[ ] CHANGELOG.md atualizado
[ ] README.md atualizado (bundleUrl, CSP, self-hosting)
[ ] git tag v0.1.0
[ ] npm publish --dry-run
[ ] npm publish
```

---

## 11. Estrutura final do `dist/`

```
dist/
  libras-translator.js       ← ESM (import)
  libras-translator.cjs      ← CommonJS (require)
  libras-translator.js.map   ← sourcemap ESM
  libras-translator.cjs.map  ← sourcemap CJS
  index.d.ts                 ← tipos unificados (rollupTypes: true)
```

Nenhum `.css`, nenhum asset, nenhum arquivo de source.
