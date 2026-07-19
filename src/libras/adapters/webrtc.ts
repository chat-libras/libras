// ---------------------------------------------------------------------------
// Helpers genéricos de WebRTC: extraem um MediaStream contendo APENAS o áudio de
// fontes diversas (um <video>, uma track, uma RTCPeerConnection), pronto para
// alimentar o plugin:
//
//   <LibrasTranslator audio={{ kind: 'stream', stream }}
//                     asr={{ provider: 'deepgram', apiKey }} />
//
// O plugin traduz o áudio do participante REMOTO de uma chamada. A Web Speech API
// (grátis) só ouve o microfone local — por isso o caminho de stream exige um ASR
// de nuvem (ex.: Deepgram). Ver src/libras/core/asr/phrase-source.ts.
//
// Estes helpers não têm dependências de plataforma: servem de base para os
// adapters concretos (Vonage, Twilio, Agora, WebRTC puro).
// ---------------------------------------------------------------------------

/** Envolve uma única track de áudio num MediaStream novo. */
export function audioStreamFromTrack(track: MediaStreamTrack): MediaStream {
  return new MediaStream([track]);
}

/** Junta as audio tracks de um conjunto de streams num único MediaStream. */
function audioOnly(...streams: MediaStream[]): MediaStream {
  const tracks = streams.flatMap((s) => s.getAudioTracks());
  return new MediaStream(tracks);
}

/**
 * Extrai o áudio de um elemento <video> (ou <audio>) via captureStream().
 * Útil quando a plataforma renderiza um <video> mas não expõe o MediaStream
 * diretamente (caso comum: Vonage, players embutidos).
 *
 * Requer que o elemento já esteja tocando mídia. Lança se o navegador não
 * suportar captureStream (Safari mais antigo).
 */
export function audioStreamFromVideoElement(
  el: HTMLVideoElement | HTMLAudioElement
): MediaStream {
  // srcObject já é o próprio MediaStream (caminho ideal — evita captureStream).
  if (el.srcObject instanceof MediaStream) {
    return audioOnly(el.srcObject);
  }
  const capturable = el as HTMLVideoElement & {
    captureStream?: () => MediaStream;
    mozCaptureStream?: () => MediaStream;
  };
  const capture = capturable.captureStream ?? capturable.mozCaptureStream;
  if (!capture) {
    throw new Error(
      'Este navegador não suporta captureStream() no <video>. Passe o MediaStream diretamente.'
    );
  }
  return audioOnly(capture.call(el));
}

/**
 * Junta as audio tracks recebidas de uma RTCPeerConnection (o áudio remoto).
 * Para integrações com WebRTC puro, sem SDK de plataforma.
 */
export function audioStreamFromPeerConnection(pc: RTCPeerConnection): MediaStream {
  const tracks = pc
    .getReceivers()
    .map((r) => r.track)
    .filter((t): t is MediaStreamTrack => t != null && t.kind === 'audio');
  return new MediaStream(tracks);
}
