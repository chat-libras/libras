# Spec: Adapter de Provedor de Videochamada

## O que é

Um adapter extrai o `MediaStream` de áudio do participante remoto (quem fala) de qualquer SDK
de videochamada e entrega ao plugin para que o avatar VLibras sinalize em Libras.

O plugin não depende de nenhum SDK específico. A camada de adapter é a única que conhece o
SDK do app — o core recebe sempre um `MediaStream` genérico.

---

## Quando usar

Sempre que o áudio do participante remoto vem de uma chamada de vídeo (não do microfone local).
O adapter resolve a diferença entre o que cada SDK expõe e o que o plugin aceita.

---

## Spec 1 — `VideoParticipantLike`: adapter para SDKs com container DOM

### Problema que resolve

SDKs que injetam um `<video>` dentro de um container DOM (Vonage, Daily, Jitsi) não expõem
o `MediaStream` diretamente. O adapter localiza o `<video>` dentro do elemento e extrai o áudio.

### Interface

```typescript
export interface VideoParticipantLike {
  element?: HTMLElement; // container onde o SDK injeta o <video>
  on(event: string, handler: (...args: unknown[]) => void): void;
}
```

Tipagem estrutural — qualquer objeto que satisfaça esta forma funciona, sem dependência de
nenhum pacote de SDK em runtime.

### Funções disponíveis

```typescript
// Síncrona — lança se o <video> ainda não foi renderizado
audioStreamFromVideoParticipant(participant: VideoParticipantLike): MediaStream

// Assíncrona — aguarda o evento que indica que o <video> está pronto
audioStreamFromVideoParticipantAsync(
  participant: VideoParticipantLike,
  readyEvent?: string  // default: 'videoElementCreated'
): Promise<MediaStream>
```

### Uso

```typescript
import { audioStreamFromVideoParticipantAsync } from 'libras-translator';

// O SDK entregou o participante remoto — aguarda o <video> ficar disponível
const stream = await audioStreamFromVideoParticipantAsync(
  remoteParticipant,
  'videoElementCreated'  // nome do evento no seu SDK
);

// Passa o stream para o plugin
<LibrasTranslator
  audio={{ kind: 'stream', stream }}
  asr={{ provider: 'custom', factory: meuASRFactory }}
/>
```

### `readyEvent` por SDK

| SDK | Evento |
|---|---|
| Vonage / OpenTok | `'videoElementCreated'` (default) |
| Daily.co | `'track-started'` |
| Jitsi Meet | `'videoAvailable'` |

### Critérios de aceite

- Nenhum import de SDK externo dentro de `video-participant.ts`
- Funciona com qualquer objeto que satisfaça `VideoParticipantLike`
- Versão síncrona lança com mensagem clara se o `<video>` não existe
- `readyEvent` é configurável; default é o evento mais comum

---

## Spec 2 — Helpers primitivos (WebRTC puro)

Para SDKs que expõem diretamente a track ou a conexão, use os helpers de baixo nível:

```typescript
import {
  audioStreamFromTrack,           // MediaStreamTrack → MediaStream
  audioStreamFromVideoElement,    // <video> ou <audio> → MediaStream
  audioStreamFromPeerConnection,  // RTCPeerConnection → MediaStream (áudio remoto)
} from 'libras-translator';
```

### Quando usar cada um

```typescript
// SDK expõe MediaStreamTrack:
const stream = audioStreamFromTrack(participant.audioTrack);

// SDK renderiza um <video> acessível diretamente:
const stream = audioStreamFromVideoElement(videoEl);

// WebRTC puro, sem SDK de plataforma:
pc.ontrack = () => {
  const stream = audioStreamFromPeerConnection(pc);
  setRemoteStream(stream);
};
```

### Critérios de aceite

- `audioStreamFromVideoElement` lança com mensagem clara se `captureStream` não é suportado
- `audioStreamFromPeerConnection` retorna stream mesmo que não haja tracks ainda (vazio)
- Nenhuma dependência de plataforma; funciona em qualquer app WebRTC

---

## Spec 3 — ASR com fallback automático para Web Speech

### Problema que resolve

O ASR do provedor pode falhar (stream ausente, SDK não conectado, erro de rede). Sem fallback,
o avatar para de funcionar sem aviso. Com `withWebSpeechFallback`, o plugin cai silenciosamente
para o microfone local via Web Speech API.

### Função

```typescript
import { withWebSpeechFallback } from 'libras-translator';

export function withWebSpeechFallback(
  primaryFactory: ASRFactory,
  lang?: string  // default: 'pt-BR'
): ASRFactory
```

### Comportamento

1. Stream ausente ou sem tracks → Web Speech diretamente (sem tentar o primary)
2. `primary.start()` lança → Web Speech como fallback
3. Primary funciona → sem fallback, Web Speech não é iniciado

### Uso

```typescript
asr={{
  provider: 'custom',
  factory: withWebSpeechFallback(meuProviderFactory, 'pt-BR'),
}}
```

### Critérios de aceite

- Fallback sobe sem re-render e sem alterar o `status` visível
- `status` permanece `'listening'` independente de qual ASR está ativo
- Se nenhum ASR funcionar → `status: 'error'` com mensagem descritiva
- Testável com factory que lança — sem rede, sem microfone real

---

## Como o plugin recebe o stream

```
SDK de videochamada
  └─ adapter (video-participant / webrtc)
       └─ MediaStream de áudio
            └─ audio={{ kind: 'stream', stream }}
                 └─ asr={{ provider: 'custom', factory }}
                      └─ avatar VLibras sinaliza em Libras
```

O `audio={{ kind: 'microphone' }}` usa o microfone local direto — sem adapter.
