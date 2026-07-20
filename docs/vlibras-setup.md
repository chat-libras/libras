# Assets do VLibras

O player do VLibras **não é um pacote npm**: é um bundle Unity/WebGL (avatar Ícaro)
que expõe `window.VLibras.Player` e baixa os assets Unity de um diretório estático.

Por serem arquivos grandes (~13 MB, incluindo `.wasm` e `.data`), eles **não são
versionados no git** (ver `.gitignore` → `public/vlibras/`).

## Padrão: assets Unity via CDN (não precisa dos 13 MB locais)

Por padrão, o loader busca os assets Unity (`target/`) direto do **CDN oficial**
(jsDelivr), então **não é preciso ter a pasta `target/` localmente** para o avatar
funcionar num PC recém-clonado. O default está em `vlibras-loader.ts`:

```
https://cdn.jsdelivr.net/gh/spbgovbr-vlibras/vlibras-portal@<sha>/app/target
```

- Fixado num **commit SHA** (não na branch `@sgd`) para não quebrar se a branch
  mudar. Para atualizar, pegue o novo SHA em
  https://github.com/spbgovbr-vlibras/vlibras-portal e troque em `vlibras-loader.ts`.
- O CDN responde `200` com `Access-Control-Allow-Origin: *`, então funciona
  cross-origin (o Unity baixa os `.unityweb` via XHR).
- **Requer internet em runtime.** Para ambiente offline, use os arquivos locais
  (seção abaixo) passando `targetPath: '/vlibras/target'` nas opções do plugin.

> O bundle `vlibras.js` (~47 KB) **continua sendo carregado localmente** de
> `/vlibras/vlibras.js`; só os assets Unity pesados vêm do CDN.

## Assets locais (fallback / offline)

A pasta `public/vlibras/` deste projeto já traz os arquivos e serve como fallback
offline. Para forçar o uso local, passe `targetPath: '/vlibras/target'` (e, se
quiser, `bundleUrl: '/vlibras/vlibras.js'`) nas opções do plugin `vlibras`.

Se você clonar o projeto **sem** essa pasta e quiser rodar offline, reconstrua-a
com a estrutura abaixo.

### O que precisa existir

O loader usa, localmente:

- o bundle em `/vlibras/vlibras.js` (define `window.VLibras`)
- os assets Unity em `/vlibras/target/`

Ou seja, a estrutura final em `public/` deve ser:

```
public/vlibras/
├── vlibras.js                              # bundle do player (~47 KB)
└── target/
    ├── UnityLoader.js                      # loader do Unity (~156 KB)
    ├── playerweb.json                      # manifesto do build WebGL
    ├── playerweb.data.unityweb             # dados/assets do avatar (~10 MB)
    ├── playerweb.wasm.code.unityweb        # código WASM (~3 MB)
    └── playerweb.wasm.framework.unityweb   # framework WASM (~76 KB)
```

## De onde vêm

O bundle é o player oficial open-source do governo federal:

- **Repositório:** https://github.com/spbgovbr-vlibras/vlibras-player-webjs
- **Licença:** LGPLv3
- **Versão dos assets embutida neste projeto:** `2018.3.1 / WEBGL`

O `vlibras.js` aponta internamente para os serviços oficiais:

- `https://dicionario2-dth.vlibras.gov.br/...` — dicionário de sinais
- `https://traducao2-dth.vlibras.gov.br/dl/translate` — serviço de tradução

## Reconstruir a pasta local (só se precisar de offline)

Com o CDN como padrão, você **não precisa** disto para rodar online — só se quiser
o fallback offline. Escolha **uma** das opções.

### Opção A — copiar de um clone que já funciona (mais rápido)

Se você já tem o projeto rodando em outra máquina, copie a pasta inteira:

```bash
# no PC que já tem os assets, a partir da raiz do projeto:
tar czf vlibras-assets.tar.gz public/vlibras

# transfira o vlibras-assets.tar.gz (pen drive, scp, etc.) e no PC novo:
tar xzf vlibras-assets.tar.gz   # recria public/vlibras/
```

Ou via `scp` direto entre as máquinas:

```bash
scp -r usuario@pc-antigo:/caminho/do/projeto/public/vlibras ./public/
```

### Opção B — obter do projeto oficial

1. Clone o player oficial:
   ```bash
   git clone https://github.com/spbgovbr-vlibras/vlibras-player-webjs
   ```
2. Gere/baixe o bundle e os assets Unity conforme as instruções do README de lá
   (build WebGL `2018.3.1`).
3. Copie os arquivos para dentro de `public/vlibras/` seguindo a estrutura da
   seção **"O que precisa existir"** acima.

## Verificar se ficou correto

```bash
npm run dev
```

O avatar Ícaro deve aparecer. Se houver erro, abra o DevTools (aba Network) e
confira os `200`:

- **Padrão (CDN):** `/vlibras/vlibras.js` local + `.../vlibras-portal@<sha>/app/target/playerweb.json`
  no `cdn.jsdelivr.net`.
- **Modo local:** `/vlibras/vlibras.js` e `/vlibras/target/playerweb.json`. Se algum
  der `404`, a pasta `public/vlibras/target/` não existe — reconstrua-a (seção acima).

## Hospedando em outro caminho

Se preferir servir os assets de outro lugar (CDN, subpasta), passe `bundleUrl` e
`targetPath` nas opções do plugin `vlibras` — ver a tabela de configuração no
[README](../README.md).
