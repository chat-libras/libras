import { describe, it, expect } from 'vitest';
import { newIncomingMessages, resolveLabels, DEFAULT_LABELS } from '../libras/ui/utils/messages';
import type { LibrasChatMessage, LibrasChatRole } from '../libras/ui/interfaces/LibrasChatProps';

const msg = (id: string, from: LibrasChatRole, text = 't'): LibrasChatMessage => ({ id, from, text });

describe('newIncomingMessages', () => {
  it('retorna só mensagens do OUTRO lado, a partir do índice visto', () => {
    const messages = [msg('1', 'doctor'), msg('2', 'client'), msg('3', 'doctor')];
    expect(newIncomingMessages(messages, 'client', 0).map((m) => m.id)).toEqual(['1', '3']);
  });

  it('ignora as já vistas (antes de `seen`)', () => {
    const messages = [msg('1', 'doctor'), msg('2', 'doctor')];
    expect(newIncomingMessages(messages, 'client', 1).map((m) => m.id)).toEqual(['2']);
  });

  it('nunca devolve as próprias mensagens', () => {
    const messages = [msg('1', 'client'), msg('2', 'client')];
    expect(newIncomingMessages(messages, 'client', 0)).toEqual([]);
  });
});

describe('resolveLabels', () => {
  it('usa os defaults quando nada é passado', () => {
    expect(resolveLabels()).toEqual(DEFAULT_LABELS);
  });

  it('permite sobrescrever por papel', () => {
    expect(resolveLabels({ client: 'Paciente' })).toEqual({ doctor: 'Médico', client: 'Paciente' });
  });
});
