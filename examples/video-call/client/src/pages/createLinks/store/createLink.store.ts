import { useState } from 'react';
import { createCallLinkGateway } from '../../../infra/gateways.ts';
import type { CallLinkModel, CreateCallLinkInput } from '../../../modules/call-link/call-link.model.ts';
import type { UseCreateLinkResult } from './createLink.store.types.ts';

export function useCreateLink(): UseCreateLinkResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createLink = async (input: CreateCallLinkInput): Promise<CallLinkModel | null> => {
    setLoading(true);
    setError(null);
    try {
      return await createCallLinkGateway().create(input);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao criar link');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createLink, loading, error };
}
