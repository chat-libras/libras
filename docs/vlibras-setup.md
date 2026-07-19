# Guia: hospedar os assets do VLibras

Como ativar o avatar oficial do VLibras (Ícaro) no seletor de avatar. A **lógica de
sincronização já está pronta e testada** (`VLibrasSignRenderer`); falta só disponibilizar
o player e os assets Unity.

> ⚠️ O VLibras é **LGPLv3** e roda em **Unity/WebGL** (pesado, ~alguns MB + segundos de
> carga). Use quando a prioridade for **fidelidade** dos sinais.

## Entendendo as 2 partes

O player precisa de dois artefatos:

1. **Bundle do player** (`vlibras.js`) — define `window.VLibras.Player`. Carregado via `<script>`.
2. **Assets Unity** (o `targetPath`) — a pasta com o avatar 3D:
   - `UnityLoader.js`
   - `playerweb.json`
   - `Build/` (arquivos `.data`, `.wasm`/`.asm`, `.js` do Unity)

Além disso, o player busca as **animações de cada sinal** de um dicionário remoto
(`dictionaryUrl`, por padrão em `vlibras.gov.br`) — isso exige acesso à internet.

## Passo a passo (app web)

### 1. Obter os artefatos

Duas formas:

**A) Copiar da distribuição oficial (mais rápido)**
Os arquivos são servidos em `https://vlibras.gov.br/app/`. Baixe para dentro do projeto:
- `vlibras-plugin.js` (ou o bundle do player) → renomeie para `vlibras.js`
- a pasta `target/` (UnityLoader.js, playerweb.json, Build/)

**B) Buildar do código-fonte**
```bash
git clone https://github.com/spbgovbr-vlibras/vlibras-player-webjs
cd vlibras-player-webjs && npm install && npm run build   # webpack → dist/
```
Pegue o bundle gerado + a pasta `target/` (assets Unity) do repositório.

### 2. Colocar em `public/` (o Vite serve como estático)

```
public/
  vlibras/
    vlibras.js         ← bundle do player  → servido em /vlibras/vlibras.js
    target/
      UnityLoader.js    → /vlibras/target/UnityLoader.js
      playerweb.json
      Build/ ...
```

Esses caminhos batem com os **defaults** do nosso loader:
```ts
// src/engine/vlibras/vlibras-loader.ts
bundleUrl: '/vlibras/vlibras.js'
targetPath: '/vlibras/target'
```
Se hospedar em outro lugar, ajuste em `useVLibrasRenderer.ts` passando as opções a
`createVLibrasPlayer(container, { bundleUrl, targetPath, avatar })`.

### 3. Rodar e testar

```bash
npm run dev
```
1. Na aba **Tradutor**, clique em **"VLibras"** no seletor.
2. O avatar Ícaro deve carregar (uns segundos). Se aparecer "VLibras não disponível",
   confira os caminhos e o console do navegador.
3. Digite/fale uma frase → o Ícaro sinaliza. Frases em sequência entram na **fila
   sincronizada** (não atropelam) — isso é o `VLibrasSignRenderer`.

## Ajustes finos (já previstos no código)

- **`animation:end` espúrio:** o player chama `stop()` internamente ao traduzir, o que pode
  emitir um evento de fim falso. Já mitigamos com `settleMs: 250` em `useVLibrasRenderer.ts`
  (ignora fins nos primeiros 250 ms após um `translate`). Aumente se notar atropelo.
- **Trocar avatar:** passe `avatar: 'icaro' | 'hozana' | 'guga'` ao `createVLibrasPlayer`.
- **Evento de fim alternativo:** se `animation:end` não for confiável, use a opção `endEvent`
  do `VLibrasSignRenderer` (ex.: derivar de `response:glosa`).

## Servir corretamente os assets Unity (armadilhas comuns)

- **MIME/compressão:** builds Unity WebGL usam `.wasm`/`.data` (às vezes `.gz`/`.br`).
  O servidor precisa enviar `Content-Type` e `Content-Encoding` corretos, senão dá
  `RangeError`/falha de carga. O `vite preview`/dev cobre o básico; em produção, configure
  o servidor (Nginx/hosting) para esses tipos.
- **CORS do dicionário:** as animações vêm de `vlibras.gov.br`. Bloqueio de rede/CSP quebra
  a sinalização mesmo com o avatar carregado.
- **HTTPS:** sirva por HTTPS (ou localhost) para evitar mixed-content.

## Na extensão MV3 (opcional, depois)

Para usar o VLibras no painel lateral da extensão:
1. Copie `vlibras/` para `extension-static/` (vira `dist-extension/vlibras/`).
2. Ajuste o CSP do `manifest.json` para permitir o Unity/WebGL e o domínio do dicionário.
3. Adicione o seletor de avatar ao `SidePanelApp` (hoje é só o avatar local).

## Licença

O VLibras é **LGPLv3**. Ao distribuir, cumpra as obrigações da licença (disponibilizar o
código do componente LGPL e permitir sua substituição). Nosso código permanece separado
atrás da interface `SignRenderer`.
