import type { LibrasChatMessage, LibrasChatRole } from '../interfaces/LibrasChatProps';

// Helpers puros do chat (sem React/DOM) — testáveis isoladamente.

export const DEFAULT_LABELS: Record<LibrasChatRole, string> = {
  doctor: 'Médico',
  client: 'Cliente',
};

/** Aplica os rótulos padrão, permitindo sobrescrever por papel. */
export function resolveLabels(
  labels?: Partial<Record<LibrasChatRole, string>>
): Record<LibrasChatRole, string> {
  return { ...DEFAULT_LABELS, ...labels };
}

/**
 * Mensagens novas (a partir do índice `seen`) enviadas pelo OUTRO lado — as que
 * este lado ainda precisa processar (ex.: o cliente sinaliza as falas do médico).
 */
export function newIncomingMessages(
  messages: LibrasChatMessage[],
  mine: LibrasChatRole,
  seen: number
): LibrasChatMessage[] {
  return messages.slice(seen).filter((m) => m.from !== mine);
}
