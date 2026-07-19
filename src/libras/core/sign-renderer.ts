// ---------------------------------------------------------------------------
// Interface comum de renderizador de sinais (padrão Strategy / DIP).
//
// A camada de fala/ASR/fila fala com esta interface, não com um avatar
// específico. Assim podemos trocar entre o nosso avatar (LocalSignRenderer) e
// o avatar oficial do VLibras (VLibrasSignRenderer) sem mudar o resto.
//
// Cada renderizador é responsável por sua PRÓPRIA fila e sincronização
// (não atropelar sinais, manter ordem, descartar backlog quando a fala vem
// mais rápido que a sinalização).
// ---------------------------------------------------------------------------

export interface SignRenderer {
  /** Enfileira uma frase para ser sinalizada (fluxo contínuo). */
  play(text: string): void;
  /** Esvazia a fila e interrompe. */
  clear(): void;
  /** Velocidade da sinalização (1 = normal). */
  setSpeed(speed: number): void;
  /** Está sinalizando algo agora? */
  readonly busy: boolean;
  /** Quantas frases/segmentos aguardam na fila. */
  readonly pending: number;
  dispose(): void;
}
