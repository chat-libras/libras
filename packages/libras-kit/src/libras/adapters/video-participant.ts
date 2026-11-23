import { audioStreamFromVideoElement } from './webrtc';

// ---------------------------------------------------------------------------
// Adapter genérico para SDKs de videochamada que expõem um container DOM com
// um <video> interno (Vonage/OpenTok, Daily, Jitsi Meet, Whereby…).
//
// Uso:
//   const stream = await audioStreamFromVideoParticipantAsync(remoteParticipant);
//   <LibrasTranslator audio={{ kind: 'stream', stream }}
//                     asr={{ provider: 'custom', factory: myASRFactory }} />
//
// Traduza o áudio do participante REMOTO (quem fala) — não o seu.
// A Web Speech API não serve aqui; injete um ASR via { provider: 'custom', factory }.
//
// Tipagem estrutural (duck-typing): não depende de nenhum pacote de SDK em
// runtime. Se o objeto do seu SDK satisfaz VideoParticipantLike, funciona.
// Para SDKs que expõem MediaStreamTrack diretamente, use audioStreamFromTrack.
// Para RTCPeerConnection puro, use audioStreamFromPeerConnection.
// Ambos estão em adapters/webrtc.ts.
// ---------------------------------------------------------------------------

/**
 * Contrato mínimo de um participante/subscriber de videochamada:
 * um container DOM opcional e um método para assinar eventos.
 *
 * Compatível com qualquer SDK que siga este padrão estrutural —
 * Vonage Subscriber, Daily Participant, Jitsi Remote, etc.
 * Se o seu SDK não segue este padrão, use os helpers de baixo nível em
 * adapters/webrtc.ts (audioStreamFromTrack, audioStreamFromVideoElement…).
 */
export interface VideoParticipantLike {
  /** Container DOM onde o SDK injeta o <video>. Pode ainda não existir. */
  element?: HTMLElement;
  /** Assina eventos do participante (assinatura genérica). */
  on(event: string, handler: (...args: unknown[]) => void): void;
}

function findVideo(el: HTMLElement | undefined): HTMLVideoElement | null {
  if (!el) return null;
  if (el instanceof HTMLVideoElement) return el;
  return el.querySelector('video');
}

/**
 * Extrai o MediaStream de áudio de um participante cujo <video> já existe.
 * Lança se o elemento ainda não foi renderizado — nesse caso use a variante
 * async abaixo, que aguarda o evento de criação do elemento.
 */
export function audioStreamFromVideoParticipant(participant: VideoParticipantLike): MediaStream {
  const video = findVideo(participant.element);
  if (!video) {
    throw new Error(
      'O <video> do participante ainda não existe. ' +
        'Use audioStreamFromVideoParticipantAsync() para aguardar o evento de criação.'
    );
  }
  return audioStreamFromVideoElement(video);
}

/**
 * Versão que aguarda o <video> ser renderizado antes de extrair o áudio.
 * Resolve imediatamente se o elemento já existe.
 *
 * @param participant  Participante/subscriber do SDK de videochamada.
 * @param readyEvent   Nome do evento que o SDK dispara quando o <video> fica
 *                     disponível. Depende do SDK:
 *                       - Vonage/OpenTok: 'videoElementCreated'
 *                       - Daily:          'track-started'
 *                       - Jitsi:          'videoAvailable'
 *                     O adapter localiza o <video> dentro de `participant.element`
 *                     ao receber o evento — o payload do evento não é usado.
 */
export function audioStreamFromVideoParticipantAsync(
  participant: VideoParticipantLike,
  readyEvent = 'videoElementCreated'
): Promise<MediaStream> {
  const existing = findVideo(participant.element);
  if (existing) return Promise.resolve(audioStreamFromVideoElement(existing));

  return new Promise((resolve, reject) => {
    participant.on(readyEvent, () => {
      const video = findVideo(participant.element);
      if (video) resolve(audioStreamFromVideoElement(video));
      else
        reject(
          new Error(
            `Evento "${readyEvent}" disparado mas nenhum <video> encontrado ` +
              `em participant.element. Verifique se o SDK popula o elemento antes do evento.`
          )
        );
    });
  });
}
