// ===========================================================================
// Adapters de plataforma: conectam apps de videochamada concretos ao plugin.
//
// O core do plugin aceita um MediaStream de áudio (audio: {kind:'stream'}) ou
// texto direto (translate). Os adapters apenas PRODUZEM essas entradas a partir
// de fontes reais — sem tocar no core.
//
//   - webrtc:           helpers genéricos (<video>, track, RTCPeerConnection)
//   - video-participant: adapter genérico para SDKs com container DOM + evento
//   - captions:         legendas ao vivo → translate (ex.: Teams, sem ASR)
// ===========================================================================

export {
  audioStreamFromTrack,
  audioStreamFromVideoElement,
  audioStreamFromPeerConnection,
} from './webrtc';

export {
  audioStreamFromVideoParticipant,
  audioStreamFromVideoParticipantAsync,
} from './video-participant';
export type { VideoParticipantLike } from './video-participant';

export { createCaptionSink } from './captions';
export type { CaptionSink } from './captions';
