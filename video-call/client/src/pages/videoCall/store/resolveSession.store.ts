import { useState } from 'react';
import { createCallLinkGateway } from '../../../infra/gateways.ts';
import type { CallParams, ParticipantRole } from '../../../domain/types/index.ts';
import type { UseResolveSessionResult } from './resolveSession.store.types.ts';

export function useResolveSession(): UseResolveSessionResult {
  const [params, setParams] = useState<CallParams | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolve = async (sessionId: string, participantId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const link = await createCallLinkGateway().findById(participantId);
      if (link.roomId !== sessionId) {
        setError('Este link não pertence à sessão informada.');
        return;
      }
      setParams({ roomId: link.roomId, peerId: link.id, role: link.role as ParticipantRole });
    } catch {
      setError('Sessão não encontrada ou link de acesso inválido.');
    } finally {
      setLoading(false);
    }
  };

  return { params, loading, error, resolve };
}
