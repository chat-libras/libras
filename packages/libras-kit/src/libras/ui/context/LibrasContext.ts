import { createContext } from 'react';
import type { VLibrasSignRenderer } from '../../core/vlibras-renderer';
import type { LibrasConfig } from '../interfaces/LibrasProvider';

export const LibrasContext = createContext<LibrasConfig>({});

// Ref global compartilhado como default do contexto.
// Sem LibrasProvider, todas as instâncias de useLibrasAvatar compartilham o mesmo
// renderer (singleton do player Unity — só pode haver um por página).
export const globalRendererRef: React.MutableRefObject<VLibrasSignRenderer | null> = {
  current: null,
};

export const LibrasRendererContext = createContext<
  React.MutableRefObject<VLibrasSignRenderer | null>
>(globalRendererRef);
