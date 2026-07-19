import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createCaptionSink } from './captions';

// A fonte de legendas encaminha texto para translate() com deduplicação (a mesma
// lógica de phrase-source): descarta vazias/curtas e repetidas em <3s.
describe('createCaptionSink — legendas → translate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('encaminha linhas distintas', () => {
    const signed: string[] = [];
    const sink = createCaptionSink((t) => signed.push(t));
    sink.push('bom dia');
    sink.push('como vai');
    expect(signed).toEqual(['bom dia', 'como vai']);
  });

  it('descarta vazias e muito curtas (<2 chars)', () => {
    const signed: string[] = [];
    const sink = createCaptionSink((t) => signed.push(t));
    sink.push('');
    sink.push('   ');
    sink.push('a');
    expect(signed).toEqual([]);
  });

  it('faz trim do texto', () => {
    const signed: string[] = [];
    const sink = createCaptionSink((t) => signed.push(t));
    sink.push('  olá mundo  ');
    expect(signed).toEqual(['olá mundo']);
  });

  it('suprime a mesma linha repetida em <3s (eco de legenda)', () => {
    const signed: string[] = [];
    const sink = createCaptionSink((t) => signed.push(t));
    sink.push('mesma frase');
    vi.advanceTimersByTime(1000);
    sink.push('mesma frase');
    expect(signed).toEqual(['mesma frase']);
  });

  it('permite a mesma linha novamente após 3s', () => {
    const signed: string[] = [];
    const sink = createCaptionSink((t) => signed.push(t));
    sink.push('mesma frase');
    vi.advanceTimersByTime(3001);
    sink.push('mesma frase');
    expect(signed).toEqual(['mesma frase', 'mesma frase']);
  });
});
