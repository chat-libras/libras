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
