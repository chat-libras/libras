import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LibrasObserver } from '../libras/core/libras-observer';
import type { SignRenderer } from '../libras/core/sign-renderer';

// Drena a fila de microtasks + uma macrotask (cobre cadeias fetch.then.then)
const flushPromises = () => new Promise<void>((r) => setTimeout(r, 0));

// Renderer falso — registra chamadas play() e permite inspecionar.
class FakeRenderer implements SignRenderer {
  played: string[] = [];
  busy = false;
  pending = 0;
  play(text: string) { this.played.push(text); }
  clear() { this.played = []; }
  setSpeed(_s: number) {}
}

describe('LibrasObserver — chunking e cache', () => {
  let renderer: FakeRenderer;
  let observer: LibrasObserver;

  beforeEach(() => {
    renderer = new FakeRenderer();
    // URL falsa; o fetch é mockado abaixo
    observer = new LibrasObserver(renderer, { translatorUrl: 'http://fake/translate' });
  });

  it('sinaliza cada frase diretamente', () => {
    observer.observe(['bom dia']);
    expect(renderer.played).toEqual(['bom dia']);
  });

  it('quebra frases por ponto em cláusulas separadas', () => {
    observer.observe(['preciso de ajuda. pode me ouvir']);
    expect(renderer.played).toEqual(['preciso de ajuda', 'pode me ouvir']);
  });

  it('quebra frases por virgula e ponto e virgula', () => {
    observer.observe(['dor de cabeça, febre; tontura']);
    expect(renderer.played).toEqual(['dor de cabeça', 'febre', 'tontura']);
  });

  it('descarta cláusulas muito curtas (< 2 chars)', () => {
    observer.observe(['. a . ok']);
    // "a" e "ok" — "a" < 2 chars, "ok" ≥ 2
    expect(renderer.played).toContain('ok');
    expect(renderer.played).not.toContain('a');
  });

  it('processa varias entradas em ordem', () => {
    observer.observe(['primeira', 'segunda']);
    expect(renderer.played).toEqual(['primeira', 'segunda']);
  });

  it('clearCache() zera o contador de cache', () => {
    // Popula o cache via prefetch mockado
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: async () => 'GLOSA',
    }));
    observer.observe(['bom dia']);
    observer.clearCache();
    expect(observer.cacheSize).toBe(0);
    vi.unstubAllGlobals();
  });

  it('dispara onGlosa com resultado do prefetch', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: async () => 'BOM DIA',
    }));
    const onGlosa = vi.fn();
    const obs = new LibrasObserver(renderer, {
      translatorUrl: 'http://fake/translate',
      onGlosa,
    });
    obs.observe(['bom dia']);
    await flushPromises();
    expect(onGlosa).toHaveBeenCalledWith('bom dia', 'BOM DIA', false);
    vi.unstubAllGlobals();
  });

  it('dispara onError quando o fetch falha', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => '',
    }));
    const onError = vi.fn();
    const obs = new LibrasObserver(renderer, {
      translatorUrl: 'http://fake/translate',
      onError,
    });
    obs.observe(['minha dor']);
    await flushPromises();
    expect(onError).toHaveBeenCalledWith('minha dor', expect.stringContaining('500'));
    vi.unstubAllGlobals();
  });
});
