// ---------------------------------------------------------------------------
// LibrasObserver — canal de texto → Libras com chunking por pontuação.
//
// Recebe uma lista de textos, quebra em cláusulas (split "." → sentenças,
// depois "," e ";" → cláusulas), e enfileira cada cláusula no SignRenderer.
//
// Cache de glosa (Map<text, glosa>): evita re-request ao traducao2 para
// cláusulas já traduzidas. NÃO faz dedup por tempo — frases repetidas são
// intencionais (vícios de linguagem, itens de lista como "precisa de exame x,
// precisa de exame y").
// ---------------------------------------------------------------------------

import type { SignRenderer } from './sign-renderer.ts';

export interface LibrasObserverOptions {
  /** URL do endpoint PT→glosa. Default: traducao2.vlibras.gov.br/translate */
  translatorUrl?: string;
  /** Chamado quando a glosa é obtida — útil para debug/log. */
  onGlosa?: (text: string, glosa: string, fromCache: boolean) => void;
  /** Chamado em caso de erro na tradução. */
  onError?: (text: string, error: string) => void;
}

const DEFAULT_TRANSLATOR_URL = 'https://traducao2.vlibras.gov.br/translate';

export class LibrasObserver {
  private readonly glosaCache = new Map<string, string>();
  private readonly renderer: SignRenderer;
  private readonly translatorUrl: string;
  private readonly onGlosa?: LibrasObserverOptions['onGlosa'];
  private readonly onError?: LibrasObserverOptions['onError'];

  constructor(renderer: SignRenderer, opts: LibrasObserverOptions = {}) {
    this.renderer = renderer;
    this.translatorUrl = opts.translatorUrl ?? DEFAULT_TRANSLATOR_URL;
    this.onGlosa = opts.onGlosa;
    this.onError = opts.onError;
  }

  /**
   * Recebe uma lista de textos, faz chunking e enfileira cada cláusula.
   * Pode ser chamado com texto parcial (interim ASR) ou final.
   */
  observe(texts: string[]): void {
    for (const text of texts) {
      for (const clause of this.chunkText(text)) {
        this.signClause(clause);
      }
    }
  }

  /**
   * Split por "." → sentenças; split por "," e ";" → cláusulas.
   * Filtra cláusulas vazias ou muito curtas (< 2 chars).
   */
  private chunkText(text: string): string[] {
    return text
      .split('.')
      .flatMap((sentence) => sentence.split(/[,;]/))
      .map((c) => c.trim())
      .filter((c) => c.length >= 2);
  }

  /**
   * Sinaliza uma cláusula.
   * - Cache hit: usa renderer.play(cached_glosa) se o renderer suportar
   * - Cache miss: usa renderer.play(clause) e faz prefetch da glosa em background
   */
  private signClause(clause: string): void {
    const key = clause.toLowerCase();
    const cached = this.glosaCache.get(key);

    if (cached !== undefined) {
      this.onGlosa?.(clause, cached, true);
      // Usa play() se disponível (renderer exposto via VLibrasPlayerLike.play?)
      // Caso contrário, translate() revalida o cache do próprio player
      this.renderer.play(clause);
      return;
    }

    // Sinaliza imediatamente (player resolve PT→glosa internamente)
    this.renderer.play(clause);
    // Prefetch em background para popular o cache
    this.prefetchGlosa(clause, key);
  }

  /**
   * Chama o endpoint de tradução em background para popular o cache.
   * Não bloqueia a sinalização atual.
   */
  private prefetchGlosa(clause: string, key: string): void {
    fetch(this.translatorUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: clause }),
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((glosa) => {
        const trimmed = glosa.trim();
        if (trimmed) {
          this.glosaCache.set(key, trimmed);
          this.onGlosa?.(clause, trimmed, false);
        }
      })
      .catch((e: unknown) =>
        this.onError?.(clause, e instanceof Error ? e.message : String(e)),
      );
  }

  /** Limpa o cache de glosa (ex: ao trocar de sala). */
  clearCache(): void {
    this.glosaCache.clear();
  }

  get cacheSize(): number {
    return this.glosaCache.size;
  }
}
