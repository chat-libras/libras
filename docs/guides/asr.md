# Configuracao de ASR

ASR (Automatic Speech Recognition) converte a fala de um participante em texto, que e entao traduzido para glosa e sinalizado pelo avatar. Voce so precisa configurar ASR se algum participante vai **falar** (e nao apenas digitar).

## Quando voce precisa de ASR

| Cenario | ASR necessario? |
|---------|----------------|
| Participante digita, outro ve em Libras | Nao — passe texto diretamente para `translate()` |
| Participante fala pelo microfone | Sim — Web Speech API (gratis) |
| Traduzir o audio remoto de uma chamada WebRTC | Sim — ASR de nuvem (Deepgram ou customizado) |
| Plataforma expoe legendas ao vivo (Teams) | Nao — use `CaptionSink` em vez de ASR |

## Web Speech API

**Gratis. Funciona com microfone. Apenas Chrome e Edge.**

```tsx
import { LibrasTranslator } from 'libras-translator';

<LibrasTranslator
  audio={{ kind: 'microphone' }}
  asr={{ provider: 'webspeech', lang: 'pt-BR' }}
  showCaptions
/>
```

O `lang` padrao ja e `'pt-BR'`. Voce pode omiti-lo.

```tsx
// forma mais curta — audio microphone + webspeech pt-BR sao os defaults
<LibrasTranslator audio={{ kind: 'microphone' }} />
```

**Limitacoes:**

- Funciona apenas com `audio: { kind: 'microphone' }` — a API do navegador so acessa o microfone local.
- Nao funciona com o audio remoto de uma chamada (MediaStream de WebRTC).
- Nao disponivel no Firefox ou Safari.
- O navegador pode pedir permissao de microfone.

## ASR de nuvem (exemplo: Deepgram)

**Pago. Funciona com microfone ou stream de chamada.**

Crie uma conta em [deepgram.com](https://deepgram.com) e obtenha uma API key.

> **Seguranca:** nao exponha a API key no frontend. Use um proxy no servidor que faca a conexao com o Deepgram e repasse o stream. O exemplo abaixo e simplificado; em producao envolva a key em uma variavel de ambiente do servidor.

```tsx
import { LibrasTranslator } from 'libras-translator';

// com microfone local:
<LibrasTranslator
  audio={{ kind: 'microphone' }}
  asr={{ provider: 'deepgram', apiKey: import.meta.env.VITE_DEEPGRAM_KEY, lang: 'pt-BR' }}
/>

// com audio remoto de chamada WebRTC:
<LibrasTranslator
  audio={{ kind: 'stream', stream: remoteAudioStream }}
  asr={{ provider: 'deepgram', apiKey: import.meta.env.VITE_DEEPGRAM_KEY }}
/>
```

O `lang` padrao e `'pt-BR'`.

> O mesmo padrao se aplica a qualquer provedor de ASR de nuvem: AssemblyAI, Azure Cognitive Services Speech, AWS Transcribe, Google Cloud STT, etc. Implemente a interface `ASRFactory` (secao abaixo) para qualquer um deles.

## ASR customizado

Implemente a interface `ASRFactory` para integrar qualquer servico de transcricao.

```ts
import type { ASRFactory, CloudASR } from 'libras-translator';

const myASRFactory: ASRFactory = ({ onPhrase, onInterim, onError, onListening }) => {
  let active = false;

  return {
    async start(stream: MediaStream) {
      active = true;
      onListening(true);

      // exemplo: conectar a um servico WebSocket de ASR
      const ws = new WebSocket('wss://meu-asr.exemplo.com/transcribe');

      // enviar o audio do stream
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(e.data);
      };
      recorder.start(250);

      ws.onmessage = (e) => {
        const { text, isFinal } = JSON.parse(e.data);
        if (isFinal) {
          onPhrase(text);  // frase final → vai para o avatar
        } else {
          onInterim(text); // parcial → exibido na legenda
        }
      };

      ws.onerror = (e) => onError(new Error('ASR connection error'));
    },

    stop() {
      active = false;
      onListening(false);
      // encerrar conexao WebSocket e MediaRecorder
    },
  };
};
```

```tsx
<LibrasTranslator
  audio={{ kind: 'stream', stream }}
  asr={{ provider: 'custom', factory: myASRFactory }}
/>
```

### Callbacks disponíveis

| Callback | Quando chamar |
|----------|---------------|
| `onPhrase(text)` | Frase final reconhecida → vai para a fila do avatar |
| `onInterim(text)` | Resultado parcial → exibido na legenda ao vivo |
| `onError(err)` | Erro de conexao ou de transcricao |
| `onListening(boolean)` | Estado da escuta mudou (para atualizar a UI) |

## `withWebSpeechFallback`

Envolve uma factory primaria e cai no Web Speech API automaticamente se:

- O stream fornecido estiver vazio (sem faixas de audio), ou
- `start()` da factory primaria lancar uma excecao.

```ts
import { withWebSpeechFallback } from 'libras-translator';

const resilientFactory = withWebSpeechFallback(myDeepgramFactory, 'pt-BR');

<LibrasTranslator
  audio={{ kind: 'stream', stream: remoteStream }}
  asr={{ provider: 'custom', factory: resilientFactory }}
/>
```

Util em ambientes onde o stream remoto pode ainda nao estar disponivel quando o componente monta — evita tela de erro enquanto o ASR de nuvem nao tem sinal.

## Tabela de decisao

| Situacao | Provider recomendado |
|----------|---------------------|
| Participante usa microfone local, Chrome/Edge | `webspeech` (gratis) |
| Audio remoto de chamada WebRTC | ASR de nuvem (`custom` com `ASRFactory`) |
| Precisa suportar Firefox ou Safari com microfone | ASR de nuvem (`custom` com `ASRFactory`) |
| Servico de ASR proprio | `custom` com `ASRFactory` |
| Stream pode estar indisponivel na inicializacao | `custom` com `withWebSpeechFallback` |
| Plataforma expoe legendas (Teams, Meet API) | `CaptionSink` — ver [video-call-adapters.md](video-call-adapters.md) |

## Padrao sem custo de ASR

Se ambos os lados da chamada tiverem acesso a `libras-translator`, cada um pode transcrever a propria fala localmente (Web Speech, gratis) e enviar apenas o **texto** via sinal/mensagem para o outro lado. O `<LibrasChat>` implementa exatamente isso: um participante fala → texto transcrito localmente → enviado via `onSend` → o outro participante ve em Libras.

Nenhuma API key necessaria. Nenhum audio trafega pela rede para transcricao.
