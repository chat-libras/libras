# Integracao com plataformas de videochamada

O core do plugin so precisa de um `MediaStream` de audio (para transcrever a fala) ou de texto (para sinalizar diretamente). Os adapters em `src/libras/adapters/` extraem essas entradas de SDKs de video reais — sem alterar nada no core.

## Como os adapters funcionam

```
SDK de video (Vonage, Daily, Jitsi...)
        ↓
  adapter (extrai MediaStream)
        ↓
  AudioSource: { kind: 'stream', stream }
        ↓
  <LibrasChat> / <LibrasTranslator>
        ↓
  ASR (transcreve) → glosa → avatar
```

O plugin nao sabe nada sobre o SDK que voce usa; ele so recebe um `MediaStream` padrao da Web.

## `VideoParticipantLike` — SDKs que injetam `<video>` no DOM

A maioria dos SDKs de video (Vonage/OpenTok, Daily.co, Jitsi) injeta um elemento `<video>` em um container DOM que voce fornece, e emite um evento quando o elemento esta pronto.

```ts
interface VideoParticipantLike {
  element?: HTMLElement;
  on(event: string, handler: (...args: unknown[]) => void): void;
}

// sincrono — use quando o elemento ja existe
function audioStreamFromVideoParticipant(p: VideoParticipantLike): MediaStream

// assíncrono — aguarda o evento de pronto
function audioStreamFromVideoParticipantAsync(
  p: VideoParticipantLike,
  readyEvent?: string,
): Promise<MediaStream>
```

### Evento de pronto por SDK

| SDK | `readyEvent` |
|-----|-------------|
| Vonage / OpenTok | `'videoElementCreated'` (default) |
| Daily.co | `'track-started'` |
| Jitsi | `'videoAvailable'` |
| Outro | Passe o nome do evento do SDK |

### Vonage Video API

```tsx
import {
  audioStreamFromVideoParticipantAsync,
  LibrasChat,
  type LibrasChatMessage,
} from 'libras-translator';
import { useState } from 'react';

function ChamadaVonage({ session }: { session: OT.Session }) {
  const [messages, setMessages] = useState<LibrasChatMessage[]>([]);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const containerEl = document.createElement('div');

    session.on('streamCreated', async (e) => {
      const subscriber = session.subscribe(e.stream, containerEl, {
        insertMode: 'append',
      });
      const stream = await audioStreamFromVideoParticipantAsync(subscriber);
      setRemoteStream(stream);
    });

    // sincronizar mensagens via Vonage signal
    session.on('signal:chat', (e) => {
      const msg: LibrasChatMessage = JSON.parse(e.data);
      setMessages((m) => [...m, msg]);
    });
  }, [session]);

  const handleSend = (text: string) => {
    const msg: LibrasChatMessage = { id: crypto.randomUUID(), from: 'sender', text }
    setMessages((m) => [...m, msg]);
    session.signal({ type: 'chat', data: JSON.stringify(msg) });
  };

  return (
    <LibrasChat
      role="sender"
      messages={messages}
      onSend={handleSend}
      audio={remoteStream ? { kind: 'stream', stream: remoteStream } : undefined}
      asr={{ provider: 'deepgram', apiKey: import.meta.env.VITE_DEEPGRAM_KEY }}
    />
  );
}
```

### Daily.co

```ts
import { audioStreamFromVideoParticipantAsync } from 'libras-translator';

callObject.on('track-started', async (e) => {
  if (e.participant.local || e.track.kind !== 'audio') return;
  const stream = await audioStreamFromVideoParticipantAsync(
    e.participant,
    'track-started',
  );
  // use stream em <LibrasTranslator audio={{ kind: 'stream', stream }} />
});
```

### Jitsi

```ts
import { audioStreamFromVideoParticipantAsync } from 'libras-translator';

api.on('videoConferenceJoined', () => {
  // participante remoto
  api.on('participantJoined', async (participant) => {
    const stream = await audioStreamFromVideoParticipantAsync(
      participant,
      'videoAvailable',
    );
  });
});
```

## Primitivos WebRTC

Para SDKs que expoe a `RTCPeerConnection` ou faixas individuais (Twilio, Agora, WebRTC puro).

### `audioStreamFromPeerConnection`

Extrai todas as faixas de audio recebidas.

```ts
import { audioStreamFromPeerConnection } from 'libras-translator';

const stream = audioStreamFromPeerConnection(peerConnection);
```

### `audioStreamFromTrack`

```ts
import { audioStreamFromTrack } from 'libras-translator';

peerConnection.ontrack = (e) => {
  if (e.track.kind !== 'audio') return;
  const stream = audioStreamFromTrack(e.track);
};
```

### `audioStreamFromVideoElement`

Quando o SDK injeta um `<video>` ou `<audio>` com o stream do participante remoto.

```ts
import { audioStreamFromVideoElement } from 'libras-translator';

const videoEl = document.querySelector<HTMLVideoElement>('#remote-video')!;
const stream = audioStreamFromVideoElement(videoEl);
```

## `CaptionSink` — plataformas com legendas mas sem acesso ao audio

Algumas plataformas (Microsoft Teams com Live Captions API, Google Meet com Caption API) expoe as legendas ao vivo mas nao permitem capturar o `MediaStream` de audio. Nesse caso, em vez de ASR, use `CaptionSink`.

```ts
import { createCaptionSink, useLibrasAvatar } from 'libras-translator';

function AvatarComLegendas() {
  const { containerRef, translate } = useLibrasAvatar();

  useEffect(() => {
    // dedupeWindowMs: ignora strings identicas recebidas em menos de 2 s
    const sink = createCaptionSink(translate, 2000);

    // conecte ao evento de legenda da sua plataforma:
    teamsApi.on('captionReceived', (caption) => sink.push(caption.text));

    return () => sink.destroy();
  }, [translate]);

  return <div ref={containerRef} style={{ width: 320, height: 240 }} />;
}
```

O `CaptionSink` deduplica strings identicas recebidas dentro da janela configurada — util quando a plataforma emite atualizacoes parciais da mesma frase repetidamente.

## Exemplo completo com `<LibrasChat>`

Integracao end-to-end: audio remoto via WebRTC puro, ASR Deepgram, chat sincronizado via WebSocket.

```tsx
import {
  LibrasChat,
  audioStreamFromPeerConnection,
  type LibrasChatMessage,
} from 'libras-translator';
import { useState, useEffect, useRef } from 'react';

function Chamada({ ws }: { ws: WebSocket }) {
  const [messages, setMessages] = useState<LibrasChatMessage[]>([]);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pcRef.current = pc;

    pc.ontrack = (e) => {
      if (e.track.kind === 'audio') {
        setRemoteStream(audioStreamFromPeerConnection(pc));
      }
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'chat') {
        setMessages((m) => [...m, data.message]);
      } else {
        // sinalizacao WebRTC (offer/answer/ice)
        handleSignaling(pc, ws, data);
      }
    };

    return () => pc.close();
  }, [ws]);

  const handleSend = (text: string) => {
    const msg: LibrasChatMessage = { id: crypto.randomUUID(), from: 'sender', text }
    setMessages((m) => [...m, msg]);
    ws.send(JSON.stringify({ type: 'chat', message: msg }));
  };

  return (
    <LibrasChat
      role="sender"
      messages={messages}
      onSend={handleSend}
      audio={remoteStream ? { kind: 'stream', stream: remoteStream } : { kind: 'microphone' }}
      asr={{ provider: 'deepgram', apiKey: import.meta.env.VITE_DEEPGRAM_KEY }}
    />
  );
}
```

## O padrao sem custo — transcricao local + envio de texto

O padrao mais simples e economico: cada lado transcreve a **propria voz** localmente com Web Speech (gratis) e envia apenas o **texto** pelo canal de mensagens. Nenhum audio trafega para um servico externo.

```
Participante fala → Web Speech (local, gratis) → texto → WebSocket → Participante surdo
Participante surdo ve o texto sinalizado pelo avatar VLibras
```

E exatamente o que o `<LibrasChat>` faz por padrao quando `audio` nao e especificado: o participante ouvinte usa o microfone local com Web Speech API. Zero custo de ASR.

Use ASR de nuvem (Deepgram, AssemblyAI, Azure, etc.) apenas quando voce precisar transcrever o audio **remoto** — por exemplo, quando o lado que recebe o `<LibrasChat role="receiver">` nao pode enviar o proprio microfone (usuario surdo que nao fala).
