/** Papéis possíveis na chamada */
export type ParticipantRole = 'PATIENT' | 'HEALTH_PROFESSIONAL';

/** DTO de evento de debug enviado pelo servidor via WebSocket */
export interface DebugEventDto {
  id: string;
  ts: number;
  roomId: string;
  peerId: string;
  role: string;
  origin: string;
  category: string;
  info: string;
  details: Record<string, unknown> | null;
}

/** Parâmetros de entrada para iniciar uma chamada */
export interface CallParams {
  roomId: string;
  peerId: string;
  role: ParticipantRole;
}
