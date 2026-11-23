/** Envolve uma única track de áudio num MediaStream novo. */
export declare function audioStreamFromTrack(track: MediaStreamTrack): MediaStream;
/**
 * Extrai o áudio de um elemento <video> (ou <audio>) via captureStream().
 * Útil quando a plataforma renderiza um <video> mas não expõe o MediaStream
 * diretamente (caso comum: Vonage, players embutidos).
 *
 * Requer que o elemento já esteja tocando mídia. Lança se o navegador não
 * suportar captureStream (Safari mais antigo).
 */
export declare function audioStreamFromVideoElement(el: HTMLVideoElement | HTMLAudioElement): MediaStream;
/**
 * Junta as audio tracks recebidas de uma RTCPeerConnection (o áudio remoto).
 * Para integrações com WebRTC puro, sem SDK de plataforma.
 */
export declare function audioStreamFromPeerConnection(pc: RTCPeerConnection): MediaStream;
