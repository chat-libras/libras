import type { ChatMessage } from '../useChat/useChat.types.ts';

export interface LibrasIntegrationOptions {
  /** peers que têm libras aberto (para log) */
  librasOnPeers?: string[];
}

export interface UseLibrasIntegrationInput {
  messages: ChatMessage[];
  options?: LibrasIntegrationOptions;
}
