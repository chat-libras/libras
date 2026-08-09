import type { CallParams } from '../../../domain/types/index.ts';

export interface ResolveSessionState {
  params: CallParams | null;
  loading: boolean;
  error: string | null;
}

export interface UseResolveSessionResult extends ResolveSessionState {
  resolve: (sessionId: string, participantId: string) => Promise<void>;
}
