// ===========================================================================
// Adapters de plataforma: conectam apps de videochamada concretos ao plugin.
//
// O core do plugin aceita um MediaStream de áudio (audio: {kind:'stream'}) ou
// texto direto (translate). Os adapters apenas PRODUZEM essas entradas a partir
// de fontes reais — sem tocar no core.
//
//   - webrtc:   helpers genéricos (<video>, track, RTCPeerConnection)
//   - vonage:   Vonage Video API (Subscriber → MediaStream de áudio)
//   - captions: legendas ao vivo → translate (ex.: Teams, sem ASR)
// ===========================================================================

export {
  audioStreamFromTrack,
  audioStreamFromVideoElement,
  audioStreamFromPeerConnection,
} from './webrtc';

export {
  audioStreamFromVonageSubscriber,
  audioStreamFromVonageSubscriberAsync,
} from './vonage';
export type { VonageSubscriberLike } from './vonage';

export { createCaptionSink } from './captions';
export type { CaptionSink } from './captions';
