import { describe, it, expect, beforeEach } from 'vitest';
import { VLibrasSignRenderer, type VLibrasPlayerLike } from './vlibras-renderer';

// Player falso: registra as chamadas translate() e permite disparar o evento de
// "fim" manualmente, simulando o player assíncrono do VLibras.
class FakePlayer implements VLibrasPlayerLike {
  translated: string[] = [];
  stopped = 0;
  private endHandler: (() => void) | null = null;

  translate(text: string): void {
    this.translated.push(text);
  }
  on(event: string, handler: () => void): void {
    if (event === 'animation:end') this.endHandler = handler;
  }
  stop(): void {
    this.stopped++;
  }
  /** Simula o player terminando de sinalizar a frase atual. */
  finishCurrent(): void {
    this.endHandler?.();
  }
}

describe('VLibrasSignRenderer — sincronização de fila', () => {
  let player: FakePlayer;
  let renderer: VLibrasSignRenderer;

  beforeEach(() => {
    player = new FakePlayer();
    renderer = new VLibrasSignRenderer(player);
  });

  it('sinaliza a primeira frase imediatamente', () => {
    renderer.play('olá');
    expect(player.translated).toEqual(['olá']);
    expect(renderer.busy).toBe(true);
  });

  it('NÃO atropela: a 2ª frase só vai após o fim da 1ª', () => {
    renderer.play('primeira');
    renderer.play('segunda');
    // apenas a primeira foi enviada; a segunda aguarda na fila
    expect(player.translated).toEqual(['primeira']);
    expect(renderer.pending).toBe(1);

    player.finishCurrent(); // player terminou a 1ª
    expect(player.translated).toEqual(['primeira', 'segunda']);
    expect(renderer.pending).toBe(0);
  });

  it('mantém a ORDEM das frases', () => {
    ['um', 'dois', 'três'].forEach((p) => renderer.play(p));
    player.finishCurrent();
    player.finishCurrent();
    expect(player.translated).toEqual(['um', 'dois', 'três']);
  });

  it('fica ocioso após esvaziar a fila', () => {
    renderer.play('único');
    player.finishCurrent();
    expect(renderer.busy).toBe(false);
    expect(renderer.pending).toBe(0);
  });

  it('descarta backlog quando a fala vem mais rápido que o sinal', () => {
    const r = new VLibrasSignRenderer(player, { maxBacklog: 2 });
    r.play('f1'); // vai direto para o player (signing)
    for (let i = 2; i <= 8; i++) r.play(`f${i}`); // acumulam na fila
    // fila limitada a maxBacklog=2 (mantém as mais recentes)
    expect(r.pending).toBeLessThanOrEqual(2);
    expect(player.translated).toEqual(['f1']);
    // ao avançar, sinaliza as frases mais RECENTES (tempo real)
    player.finishCurrent();
    expect(player.translated[1]).toBe('f7');
  });

  it('clear() esvazia a fila e interrompe o player', () => {
    renderer.play('a');
    renderer.play('b');
    renderer.clear();
    expect(renderer.pending).toBe(0);
    expect(renderer.busy).toBe(false);
    expect(player.stopped).toBe(1);
  });
});
