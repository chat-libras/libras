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

/**
 * Interface comum de renderizador de sinais (padrão Strategy).
 * Permite trocar implementações (VLibras, mock, etc.) sem mudar a camada de ASR/fila.
 */
export interface SignRenderer {
  /** Enfileira uma frase para ser sinalizada (fluxo contínuo). */
  play(text: string): void;
  /** Esvazia a fila e interrompe a sinalização atual. */
  clear(): void;
  /** Ajusta a velocidade da sinalização (1 = normal). */
  setSpeed(speed: number): void;
  /** `true` enquanto o avatar estiver animando uma frase. */
  readonly busy: boolean;
  /** Número de frases aguardando na fila. */
  readonly pending: number;
  /** Libera todos os recursos (chame ao desmontar o componente). */
  dispose(): void;
}
