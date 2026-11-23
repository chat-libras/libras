# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# A partir de packages/libras-kit/
npm run dev          # demo em http://localhost:5173 (use Chrome para microfone)
npm test             # Vitest (29 testes, modo one-shot)
npm run test:watch   # Vitest em modo watch
npm run typecheck    # tsc --noEmit (sem build)
npm run build        # typecheck + bundle em dist/
```

Para rodar um único arquivo de teste:
```bash
npx vitest run src/test/vlibras-renderer.test.ts
```

## Estrutura do monorepo

```
packages/
  libras-kit/         ← biblioteca publicável
examples/
  demo/               ← harness de desenvolvimento
  video-call/         ← videochamada WebRTC real (server + client)
```

## Arquitetura da libras-kit

```
packages/libras-kit/src/libras/
  core/                 ← lógica pura, testável, sem React
    sign-renderer.ts    ← interface SignRenderer (DIP)
    vlibras-renderer.ts ← fila sincronizada PT→glosa→sinal (VLibrasSignRenderer)
    vlibras-loader.ts   ← singleton do player Unity/WebGL (createVLibrasPlayer)
    vlibras-constants.ts← URLs dos serviços VLibras (fonte única)
    libras-observer.ts  ← observa textos e aciona o renderer (chunking + cache de glosa)
    asr/                ← captura de áudio + ASR → frases
      phrase-source.ts  ← unifica AudioSource + ASROptions → callback de frases
      webspeech.ts      ← Web Speech API (microfone, grátis)
      cloud-asr.ts      ← interfaces CloudASR / ASRFactory
      with-webspeech-fallback.ts ← decorator: ASR primário + fallback Web Speech
  ui/                   ← hooks e componentes React
    context/
      LibrasContext.ts  ← createContext (LibrasContext + LibrasRendererContext)
      LibrasProvider.tsx← <LibrasProvider> + useLibrasConfig + useLibrasRendererRef
    hooks/
      useLibrasAvatar.ts    ← só o avatar: carrega player, expõe translate()
      useLibrasTranslator.ts← avatar + ASR (compõe o hook acima)
    components/
      LibrasAvatar.tsx  ← componente único headless (avatar + chat opcional)
    consts/
      strings.ts        ← LibrasStrings, DEFAULT_STRINGS, resolveStrings()
    interfaces/
      LibrasProvider.ts ← LibrasConfig, A11yOptions
      LibrasAvatar.ts   ← LibrasAvatarProps, LibrasMessage, ClassNames, Styles
    utils/
      resolveAsr.ts     ← escolhe ASR baseado em AudioSource + ASROptions
  adapters/             ← produzem MediaStream/texto de plataformas reais
    webrtc.ts           ← helpers genéricos (track, <video>, RTCPeerConnection)
    captions.ts         ← legendas ao vivo → translate (ex.: Teams)
  index.ts              ← API pública (re-exports)
```

### O player do VLibras

O avatar é o **VLibras** (gov.br), Unity/WebGL. Não é um pacote npm: é um bundle que expõe `window.VLibras.Player`, servido localmente em `packages/libras-kit/public/vlibras/vlibras.js`.

**Dois problemas históricos resolvidos no código:**

1. **Hosts `-dth` quebrados** — o bundle aponta para `traducao2.vlibras.gov.br` e `dicionario2.vlibras.gov.br` (sem `-dth`). Os hosts antigos com `-dth` retornam 401 no tradutor e servem os sinais sem CORS. Se o avatar voltar a soletrar tudo (datilologia), checar se o bundle sofreu regressão nos hosts.

2. **Fila sincronizada** — `VLibrasSignRenderer` resolve a concorrência: o player só aceita uma frase por vez; a fila descarta backlog quando a fala supera a velocidade de sinalização. Testado com `FakePlayer` em `src/test/vlibras-renderer.test.ts`.

### Fluxo de uma frase até o sinal

```
texto → player.translate(texto)
  → POST traducao2.vlibras.gov.br/translate   → "EU DOR&CABEÇA" (glosa)
  → player.play(glosa)
  → GET dicionario2.vlibras.gov.br/.../BR/<PALAVRA>  (AssetBundle Unity por sinal)
  → animação no avatar
```

Se o tradutor falhar (erro de rede/auth), o player cai no fallback `play(texto.toUpperCase())` e o avatar **soletra** — esse é sempre o sintoma de problema na etapa de tradução.

### Self-hosting do tradutor (opcional)

`docker-compose.translator.yml` sobe o stack oficial (API Node + text-core Python + RabbitMQ + Redis + MongoDB) para uso offline. Para apontar o app para ele, passe `vlibras={{ translatorUrl: '/vlibras-translate' }}` e adicione proxy no Vite. Ver `docs/vlibras-setup.md`.

### Testes

Os 5 arquivos de teste ficam em `packages/libras-kit/src/test/`. O Vitest não tem configuração explícita no `vite.config.ts` — descobre `*.test.ts` automaticamente dentro de `src/`. Não há mocks de módulos; o `VLibrasSignRenderer` é testado injetando um `FakePlayer` (pattern de DIP usado no core).
