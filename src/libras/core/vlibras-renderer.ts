import type { SignRenderer } from './sign-renderer';

// ---------------------------------------------------------------------------
// Adapter do player oficial do VLibras (avatar Ícaro) para a interface
// SignRenderer — usado quando a prioridade é FIDELIDADE dos sinais.
//
// O problema de sincronização resolvido aqui: o player do VLibras é assíncrono
// e sinaliza uma tradução por vez. Se alimentarmos translate() enquanto ele
// ainda sinaliza, atropela. A solução é uma FILA dirigida pelo evento de fim:
//
//   play(frase) → empurra na fila → se ocioso, translate(próxima)
//   player emite "fim" → puxa a próxima da fila
//   fila cheia (fala mais rápida que sinal) → descarta as mais antigas
//
// A lógica de fila é testável isoladamente (injetamos um player falso).
// ---------------------------------------------------------------------------

/** Contrato mínimo do player do VLibras que precisamos (DIP). */
export interface VLibrasPlayerLike {
  /** Sinaliza um texto/glosa. */
  translate(text: string): void;
  /** Assina um evento (ex.: fim da animação). */
  on(event: string, handler: () => void): void;
  /** Opcional: ajuste de velocidade, se o player suportar. */
  setSpeed?(speed: number): void;
  /** Opcional: interromper a sinalização atual. */
  stop?(): void;
}

export interface VLibrasRendererOptions {
  /** Nome do evento de "terminou de sinalizar" emitido pelo player. */
  endEvent?: string;
  /** Máximo de frases na fila antes de descartar as antigas (tempo real). */
  maxBacklog?: number;
  /**
   * Janela (ms) após emitir translate() em que eventos de fim são ignorados.
   * O player do VLibras chama stop() internamente ao traduzir, o que pode emitir
   * um "animation:end" espúrio; este guarda evita atropelar a fila. Default 0
   * (desligado) para testes determinísticos — use ~250 com o player real.
   */
  settleMs?: number;
}

export class VLibrasSignRenderer implements SignRenderer {
  private queue: string[] = [];
  private signing = false;
  private lastIssuedAt = 0;
  private readonly maxBacklog: number;
  private readonly settleMs: number;

  constructor(private player: VLibrasPlayerLike, opts: VLibrasRendererOptions = {}) {
    this.maxBacklog = opts.maxBacklog ?? 8;
    this.settleMs = opts.settleMs ?? 0;
    // O evento de fim dispara a próxima frase — núcleo da sincronização.
    player.on(opts.endEvent ?? 'animation:end', () => this.onEnd());
  }

  /** Trata o evento de fim, ignorando disparos espúrios logo após translate(). */
  private onEnd(): void {
    if (this.settleMs > 0 && Date.now() - this.lastIssuedAt < this.settleMs) return;
    this.advance();
  }

  play(text: string): void {
    const phrase = text.trim();
    if (!phrase) return;
    this.queue.push(phrase);
    // Mantém tempo real: se a fala acumula, mantém só as frases mais recentes.
    if (this.queue.length > this.maxBacklog) {
      this.queue.splice(0, this.queue.length - this.maxBacklog);
    }
    if (!this.signing) this.advance();
  }

  /** Puxa a próxima frase da fila e manda o player sinalizar. */
  private advance(): void {
    const phrase = this.queue.shift();
    if (phrase === undefined) {
      this.signing = false;
      return;
    }
    this.signing = true;
    this.lastIssuedAt = Date.now();
    this.player.translate(phrase);
  }

  clear(): void {
    this.queue.length = 0;
    this.player.stop?.();
    this.signing = false;
  }

  setSpeed(speed: number): void {
    this.player.setSpeed?.(speed);
  }

  get busy(): boolean {
    return this.signing;
  }

  get pending(): number {
    return this.queue.length;
  }

  dispose(): void {
    this.clear();
  }
}
