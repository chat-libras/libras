# libras-translator

Plugin **React** de **tradução simultânea Português → Libras** usando o avatar oficial do
**VLibras** (Ícaro). Feito para embutir em apps de **chamada de vídeo** — ex.: telemedicina —
traduzindo a fala em tempo real para pessoas surdas, com **fila sincronizada** (frases não se
atropelam).

> ⚠️ O VLibras é **LGPLv3** e roda em Unity/WebGL. Os sinais são oficiais e revisados.

## Como funciona

```
áudio (microfone OU stream da chamada) ─► ASR ─► fila sincronizada ─► avatar VLibras sinaliza
                                          │
                                          ├─ microfone → Web Speech API (grátis, pt-BR)
                                          └─ stream    → ASR de nuvem (Deepgram) — exige API key
```

**Por que dois ASR?** A Web Speech API (grátis) só ouve o **microfone**. O áudio de uma chamada
de vídeo (MediaStream do WebRTC) precisa de um **ASR de nuvem**.

## Uso — componente pronto

```tsx
import { LibrasTranslator } from './libras';

// Traduzir a fala remota de uma chamada (paciente surdo vê o médico em Libras):
<LibrasTranslator
  audio={{ kind: 'stream', stream: remoteAudioStream }}   // faixa de áudio do WebRTC
  asr={{ provider: 'deepgram', apiKey: import.meta.env.VITE_DEEPGRAM_KEY }}
  showCaptions
/>
```

## Uso — hook (controle total)

```tsx
import { useLibrasTranslator } from './libras';

function CallOverlay({ stream }: { stream: MediaStream }) {
  const libras = useLibrasTranslator({
    audio: { kind: 'stream', stream },
    asr: { provider: 'deepgram', apiKey: KEY },
    onTranscript: (t) => console.log(t),
  });
  return (
    <div>
      <div ref={libras.containerRef} className="avatar" />
      {libras.interim && <p>{libras.interim}</p>}
      <button onClick={libras.listening ? libras.stop : libras.start}>
        {libras.listening ? 'Parar' : 'Traduzir'}
      </button>
    </div>
  );
}
```

Fonte pelo **microfone** (grátis, sem API key):
```tsx
useLibrasTranslator({ audio: { kind: 'microphone' }, asr: { provider: 'webspeech', lang: 'pt-BR' } });
```

## API

`useLibrasTranslator(options)` → `{ containerRef, status, error, interim, listening, start, stop, translate }`

| Opção | Tipo | Descrição |
|-------|------|-----------|
| `audio` | `{kind:'microphone'}` \| `{kind:'stream', stream}` | Fonte do áudio |
| `asr` | `{provider:'webspeech',lang?}` \| `{provider:'deepgram',apiKey,lang?}` | Motor de ASR |
| `vlibras` | `{bundleUrl?, targetPath?, avatar?}` | Onde estão os assets do VLibras |
| `autoStart` | `boolean` | Ouvir ao carregar (default `true`) |
| `onTranscript` | `(text)=>void` | Cada frase final reconhecida |

`status`: `'loading' | 'ready' | 'listening' | 'error'`.

## Rodar a demo (telemedicina)

```bash
npm install
npm run dev      # http://localhost:5173  (use o Chrome p/ o microfone)
```
A demo simula uma chamada: fale no microfone (papel do médico) → o avatar traduz para Libras.

## Assets do VLibras

O plugin carrega o player (`window.VLibras.Player`) + assets Unity de `targetPath`
(default `/vlibras/`). Já vêm baixados em `public/vlibras/` para a demo. Para hospedar no seu
projeto, veja **[docs/vlibras-setup.md](docs/vlibras-setup.md)**.

## Scripts

| Comando | O quê |
|---------|-------|
| `npm run dev` | demo em modo dev |
| `npm run build` | build (typecheck + bundle) |
| `npm test` | testes da fila sincronizada (Vitest) |
| `npm run typecheck` | checagem de tipos |

## Arquitetura (separação de responsabilidades)

```
src/libras/                 # o plugin (publicável)
  core/
    sign-renderer.ts        # interface comum (DIP)
    vlibras-renderer.ts     # fila sincronizada (testada)
    vlibras-loader.ts       # carregador singleton do player
    asr/
      phrase-source.ts      # unifica fonte de áudio + ASR → frases
      webspeech.ts          # Web Speech API (microfone)
      cloud-asr.ts          # Deepgram (stream) — plugável
  react/
    useLibrasTranslator.ts  # hook principal
    LibrasTranslator.tsx    # componente pronto
  index.ts                  # API pública
src/demo/                   # demo de telemedicina
```

## Limitações

- Latência de ~1–4s (o ASR precisa ouvir a frase antes de traduzir — inerente).
- Áudio de chamada exige ASR de nuvem (custo/API key); microfone é grátis.
- Só áudio no navegador (Meet/Zoom web, `<video>`); apps nativos não são capturáveis.
# libras-teleconsulta
