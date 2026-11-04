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
/**
 * Extrai o MediaStream de áudio de um participante cujo <video> já existe.
 * Lança se o elemento ainda não foi renderizado — nesse caso use a variante
 * async abaixo, que aguarda o evento de criação do elemento.
 */
export declare function audioStreamFromVideoParticipant(participant: VideoParticipantLike): MediaStream;
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
export declare function audioStreamFromVideoParticipantAsync(participant: VideoParticipantLike, readyEvent?: string): Promise<MediaStream>;
