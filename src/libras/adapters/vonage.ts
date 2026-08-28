import { audioStreamFromVideoElement } from './webrtc';

// ---------------------------------------------------------------------------
// Adapter para a Vonage Video API (antiga OpenTok).
//
// A Vonage roda no seu próprio web app: ao assinar um participante você recebe
// um `Subscriber`, que renderiza um <video> dentro de `subscriber.element`. Dá
// pra extrair o áudio desse <video> e alimentar o plugin:
//
//   const stream = audioStreamFromVonageSubscriber(subscriber);
//   <LibrasTranslator audio={{ kind: 'stream', stream }}
//                     asr={{ provider: 'deepgram', apiKey }} showCaptions />
//
// Traduza o áudio do participante REMOTO (o que fala) — não o seu. A Web Speech
// API não serve aqui (só ouve o microfone local); use um ASR de nuvem.
//
// Tipagem estrutural (não dependemos do pacote @vonage/client-sdk-video em
// runtime), no mesmo espírito de VLibrasPlayerLike em vlibras-renderer.ts.
// ---------------------------------------------------------------------------

/** Contrato mínimo do Subscriber da Vonage que usamos. */
export interface VonageSubscriberLike {
  /** Container DOM onde a Vonage injeta o <video>. */
  element?: HTMLElement;
  /** Assina eventos do subscriber (ex.: 'videoElementCreated'). */
  on(event: string, handler: (event: { element: HTMLElement }) => void): void;
}

/** Localiza o <video> renderizado pela Vonage dentro do container do subscriber. */
function findVideo(el: HTMLElement | undefined): HTMLVideoElement | null {
  if (!el) return null;
  if (el instanceof HTMLVideoElement) return el;
  return el.querySelector('video');
}

/**
 * Extrai o MediaStream de áudio de um Subscriber da Vonage.
 * Lança se o <video> ainda não foi renderizado — nesse caso use a variante
 * async, que aguarda o evento `videoElementCreated`.
 */
export function audioStreamFromVonageSubscriber(
  subscriber: VonageSubscriberLike
): MediaStream {
  const video = findVideo(subscriber.element);
  if (!video) {
    throw new Error(
      'O <video> do subscriber Vonage ainda não existe. Use audioStreamFromVonageSubscriberAsync().'
    );
  }
  return audioStreamFromVideoElement(video);
}

/**
 * Versão que aguarda o <video> ser renderizado antes de extrair o áudio.
 * Resolve imediatamente se o elemento já existe.
 */
export function audioStreamFromVonageSubscriberAsync(
  subscriber: VonageSubscriberLike
): Promise<MediaStream> {
  const existing = findVideo(subscriber.element);
  if (existing) return Promise.resolve(audioStreamFromVideoElement(existing));

  return new Promise((resolve, reject) => {
    subscriber.on('videoElementCreated', (event) => {
      const video = findVideo(event.element);
      if (video) resolve(audioStreamFromVideoElement(video));
      else reject(new Error('Vonage emitiu videoElementCreated sem um <video>.'));
    });
  });
}
