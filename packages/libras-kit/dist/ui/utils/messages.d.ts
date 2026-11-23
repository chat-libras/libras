import { LibrasChatMessage, LibrasChatRole } from '../interfaces/LibrasChatProps';
export declare const DEFAULT_LABELS: Record<LibrasChatRole, string>;
/** Aplica os rótulos padrão, permitindo sobrescrever por papel. */
export declare function resolveLabels(labels?: Partial<Record<LibrasChatRole, string>>): Record<LibrasChatRole, string>;
/**
 * Mensagens novas (a partir do índice `seen`) enviadas pelo OUTRO lado — as que
 * este lado ainda precisa processar (ex.: o cliente sinaliza as falas do médico).
 */
export declare function newIncomingMessages(messages: LibrasChatMessage[], mine: LibrasChatRole, seen: number): LibrasChatMessage[];
