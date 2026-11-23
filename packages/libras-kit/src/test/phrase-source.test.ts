import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { makeDedup } from '../libras/core/asr/phrase-source';

describe('makeDedup', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('encaminha frases normais', () => {
    const out: string[] = [];
    const d = makeDedup((t) => out.push(t));
    d('bom dia');
    d('como vai');
    expect(out).toEqual(['bom dia', 'como vai']);
  });

  it('descarta vazias e muito curtas (< 2 chars)', () => {
    const out: string[] = [];
    const d = makeDedup((t) => out.push(t));
    d('');
    d('  ');
    d('a');
    expect(out).toEqual([]);
  });

  it('faz trim antes de comparar e emitir', () => {
    const out: string[] = [];
    const d = makeDedup((t) => out.push(t));
    d('  olá  ');
    expect(out).toEqual(['olá']);
  });

  it('suprime repetição da mesma frase dentro de 3s', () => {
    const out: string[] = [];
    const d = makeDedup((t) => out.push(t));
    d('frase repetida');
    vi.advanceTimersByTime(2999);
    d('frase repetida');
    expect(out).toEqual(['frase repetida']);
  });

  it('permite a mesma frase novamente após 3s', () => {
    const out: string[] = [];
    const d = makeDedup((t) => out.push(t));
    d('frase repetida');
    vi.advanceTimersByTime(3001);
    d('frase repetida');
    expect(out).toEqual(['frase repetida', 'frase repetida']);
  });

  it('frases diferentes nunca sao suprimidas', () => {
    const out: string[] = [];
    const d = makeDedup((t) => out.push(t));
    d('frase A');
    d('frase B');
    d('frase A');
    expect(out).toEqual(['frase A', 'frase B', 'frase A']);
  });
});
