import { useState } from 'react';
import { createRoomGateway } from '../../../infra/gateways.ts';
import type { RoomModel } from '../../../modules/room/room.model.ts';

export function useCreateSession() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = async (): Promise<RoomModel | null> => {
    setLoading(true);
    setError(null);
    try {
      return await createRoomGateway().create();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao criar sessão');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createSession, loading, error };
}
