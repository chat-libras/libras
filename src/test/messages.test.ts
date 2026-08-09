import { describe, it, expect } from 'vitest';
import { newIncomingMessages, resolveLabels, DEFAULT_LABELS } from '../libras/ui/utils/messages';
import type { LibrasChatMessage, LibrasChatRole } from '../libras/ui/interfaces/LibrasChatProps';

const msg = (id: string, from: LibrasChatRole, text = 't'): LibrasChatMessage => ({ id, from, text });

describe('newIncomingMessages', () => {
  it('retorna só mensagens do OUTRO lado, a partir do índice visto', () => {
    const messages = [msg('1', 'sender'), msg('2', 'receiver'), msg('3', 'sender')];
    expect(newIncomingMessages(messages, 'receiver', 0).map((m) => m.id)).toEqual(['1', '3']);
  });

  it('ignora as já vistas (antes de `seen`)', () => {
    const messages = [msg('1', 'sender'), msg('2', 'sender')];
    expect(newIncomingMessages(messages, 'receiver', 1).map((m) => m.id)).toEqual(['2']);
  });

  it('nunca devolve as próprias mensagens', () => {
    const messages = [msg('1', 'receiver'), msg('2', 'receiver')];
    expect(newIncomingMessages(messages, 'receiver', 0)).toEqual([]);
  });
});

describe('resolveLabels', () => {
  it('usa os defaults quando nada é passado', () => {
    expect(resolveLabels()).toEqual(DEFAULT_LABELS);
  });

  it('permite sobrescrever por papel', () => {
    expect(resolveLabels({ receiver: 'Paciente' })).toEqual({ sender: 'Orador', receiver: 'Paciente' });
  });
});
