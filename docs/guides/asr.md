# Configuração de ASR

ASR (Automatic Speech Recognition) converte a fala de um participante em texto, que é então traduzido para glosa e sinalizado pelo avatar. Você só precisa configurar ASR se algum participante vai **falar** (e não apenas digitar).

## Quando você precisa de ASR

| Cenário | ASR necessário? |
|---------|----------------|
| Participante digita, outro vê em Libras | Não — passe texto diretamente para `translate()` |
| Participante fala pelo microfone | Sim — Web Speech API (grátis) |
| Traduzir o áudio remoto de uma chamada WebRTC | Sim — ASR de nuvem (customizado) |
| Plataforma expõe legendas ao vivo (Teams) | Não — use `CaptionSink` em vez de ASR |

## Web Speech API

**Grátis. Funciona com microfone. Apenas Chrome e Edge.**

```tsx
import { LibrasAvatar } from 'libras-kit';

// asr webspeech pt-BR é o default quando audio é microphone
<LibrasAvatar audio={{ kind: 'microphone' }} />

// explícito:
<LibrasAvatar
  audio={{ kind: 'microphone' }}
  asr={{ provider: 'webspeech', lang: 'pt-BR' }}
/>
```

**Limitações:**

- Funciona apenas com `audio: { kind: 'microphone' }` — a API do navegador só acessa o microfone local.
- Não funciona com o áudio remoto de uma chamada (MediaStream de WebRTC).
- Não disponível no Firefox ou Safari.
- O navegador pode pedir permissão de microfone.

## ASR customizado

Implemente a interface `ASRFactory` para integrar qualquer serviço de transcrição (Deepgram, AssemblyAI, Azure, AWS Transcribe, etc.).

```ts
import type { ASRFactory } from 'libras-kit';

const myASRFactory: ASRFactory = ({ onTranscript, onError }) => ({
  async start(stream: MediaStream) {
    // conectar ao serviço de ASR com `stream`
    const ws = new WebSocket('wss://meu-asr.exemplo.com/transcribe');

    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (e) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(e.data);
    };
    recorder.start(250);

    ws.onmessage = (e) => {
      const { text, isFinal } = JSON.parse(e.data);
      onTranscript(text, isFinal);  // true = frase final → avatar; false = parcial
    };

    ws.onerror = () => onError('ASR connection error');
  },

  stop() {
    // encerrar conexão WebSocket e MediaRecorder
  },
});
```

```tsx
<LibrasAvatar
  audio={{ kind: 'stream', stream: remoteAudioStream }}
  asr={{ provider: 'custom', factory: myASRFactory }}
/>
```

### Callbacks

| Callback | Quando chamar |
|----------|---------------|
| `onTranscript(text, true)` | Frase final reconhecida → vai para a fila do avatar |
| `onTranscript(text, false)` | Resultado parcial → exibido no `interim` do hook |
| `onError(message)` | Erro de conexão ou de transcrição |

## `withWebSpeechFallback`

Envolve uma factory primária e cai no Web Speech API automaticamente se:

- O stream fornecido estiver vazio (sem faixas de áudio), ou
- `start()` da factory primária lançar uma exceção.

```ts
import { withWebSpeechFallback } from 'libras-kit';

const resilientFactory = withWebSpeechFallback(myDeepgramFactory, 'pt-BR');

<LibrasAvatar
  audio={{ kind: 'stream', stream: remoteStream }}
  asr={{ provider: 'custom', factory: resilientFactory }}
/>
```

Útil em ambientes onde o stream remoto pode ainda não estar disponível quando o componente monta — evita tela de erro enquanto o ASR de nuvem não tem sinal.

## Tabela de decisão

| Situação | Provider recomendado |
|----------|---------------------|
| Participante usa microfone local, Chrome/Edge | `webspeech` (grátis, default) |
| Áudio remoto de chamada WebRTC | `custom` com `ASRFactory` |
| Precisa suportar Firefox ou Safari com microfone | `custom` com `ASRFactory` |
| Serviço de ASR próprio | `custom` com `ASRFactory` |
| Stream pode estar indisponível na inicialização | `custom` com `withWebSpeechFallback` |
| Plataforma expõe legendas (Teams, Meet API) | `CaptionSink` — ver [video-call-adapters.md](video-call-adapters.md) |

## Padrão sem custo de ASR

Cada lado transcreve a própria fala localmente (Web Speech, grátis) e envia apenas o **texto** via `onSend`/WebSocket para o outro lado, que usa `translate()` diretamente. Nenhuma API key necessária. Nenhum áudio trafega pela rede para transcrição.
