# CHANGELOG

Histórico de decisões técnicas para referência de modelos de IA.
Formato: **Problema → Decisão → Impacto** (o que evitar em futuras alterações).

---

## [2026-07] Documentação de arquitetura e slash command

**Problema:** CLAUDE.md e README.md não cobriam fluxos internos nem decisões de design acumuladas.
**Decisão:** Criados `docs/architecture.md` (fluxos, padrões, diagnóstico de regressão) e `CHANGELOG.md` (histórico de decisões). Slash command `/react-clean` criado em `.claude/commands/`.
**Impacto:** Consultar `docs/architecture.md` antes de alterar o core ou a integração com o VLibras.

---

## [2026-07] Centralização dos testes em `src/test/`

**Problema:** Arquivos de teste estavam dispersos junto com o código de produção (`adapters/`, `core/`, `ui/tests/`), dificultando localização.
**Decisão:** Todos os `*.test.ts` movidos para `src/test/`; imports relativos atualizados. O Vitest descobre automaticamente sem configuração adicional.
**Impacto:** Novos testes devem ser criados em `src/test/`. Não criar `.test.ts` dentro de pastas do código de produção.

---

## [2026-07] CLAUDE.md

**Problema:** Claude Code não tinha guia rápido do projeto.
**Decisão:** Criado `CLAUDE.md` com comandos, arquitetura de camadas e diagnósticos do VLibras.
**Impacto:** Manter o CLAUDE.md atualizado ao adicionar comandos ou mudar a arquitetura de camadas.

---

## [2026-07] Troca para endpoints públicos do VLibras (sem `-dth`)

**Problema:** O bundle `public/vlibras/vlibras.js` apontava para hosts legados `*-dth.vlibras.gov.br`. O tradutor retornava 401; o dicionário servia os sinais sem header `Access-Control-Allow-Origin` — o browser bloqueava os downloads de AssetBundles, causando datilologia em todas as palavras.
**Decisão:** URLs trocadas para `traducao2.vlibras.gov.br` e `dicionario2.vlibras.gov.br` (linhas 396–398 do bundle). `DEFAULT_TRANSLATOR_URL` em `vlibras-loader.ts` atualizado para o host novo. Proxy Vite removido (desnecessário com CORS habilitado). Stack Docker movido para self-hosting opcional.
**Impacto:** Se o avatar voltar a soletrar tudo, checar `grep -n 'dth' public/vlibras/vlibras.js` — nenhuma URL deve conter `-dth`. Hard reload (Cmd+Shift+R) obrigatório após trocar o bundle (fica em cache). Ver `docs/architecture.md#problema-dos-hosts--dth`.

---

## [2026-07] Self-hosting do tradutor PT→glosa (Docker)

**Problema:** `traducao2-dth.vlibras.gov.br/dl/translate` passou a exigir autorização (HTTP 401). Sem glosa, o player cai em `play(text.toUpperCase())` → datilologia.
**Decisão:** `docker-compose.translator.yml` criado com stack oficial `spbgovbr-vlibras` (API Node `translator-api:2.1.4` + worker Python `translator-text-core` + RabbitMQ + Redis + MongoDB). Proxy Vite `/vlibras-translate → :3000/translate` adicionado. `vlibras-loader.ts` recebeu opção `translatorUrl`.
**Impacto:** Esta solução foi **substituída** pela troca de hosts (ver entrada acima). O Docker ainda funciona para offline/independência — ativar com `vlibras={{ translatorUrl: '/vlibras-translate' }}`. Usar imagem `vlibras/translator-api:2.1.4` (não `5.x`, que mudou para PostgreSQL). `ENABLE_DL_TRANSLATION=false` em Apple Silicon (modo neural falha sob emulação amd64).

---

## [2026-07] Refactors iniciais (múltiplos commits)

**Problema:** Reorganização de código após os primeiros commits funcionais.
**Decisão:** Separação das camadas `core/`, `ui/`, `adapters/` conforme a arquitetura final. Criação de `sign-renderer.ts` (interface DIP), `phrase-source.ts` (unificação de ASR), e os adapters de plataforma.
**Impacto:** A separação core/ui/adapters é a invariante mais importante do projeto. Não importar React em `core/`; não importar `adapters/` em `ui/`.

---

## [2026-07] Setup inicial — plugin React + integração VLibras

**Problema:** Precisava de um chat assimétrico para teleconsulta onde o médico fala/escreve e o paciente surdo vê os sinais em Libras.
**Decisão:**
- Avatar oficial do VLibras (Unity/WebGL, LGPLv3) via `window.VLibras.Player` — não é npm.
- Singleton obrigatório: `playerPromise` garante que o Unity não seja instanciado 2× (StrictMode do React monta componentes 2×).
- `VLibrasSignRenderer` com fila sincronizada: player assíncrono só aceita uma frase por vez; fila com `maxBacklog` descarta frases antigas em tempo real.
- ASR plugável: `phrase-source.ts` unifica microfone (Web Speech, grátis) vs stream de chamada (Deepgram, pago).

**Impacto:** O singleton é crítico — nunca remover o `playerPromise` ou o `rendererSingleton`. A fila é testada com `FakePlayer` em `src/test/vlibras-renderer.test.ts` — manter esses testes ao alterar `VLibrasSignRenderer`.
