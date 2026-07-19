import { makeDedup } from '../core/asr/phrase-source';

// ---------------------------------------------------------------------------
// Fonte de TEXTO ao vivo → avatar, sem ASR.
//
// Quando a plataforma já entrega legendas/transcrição (ex.: legendas ao vivo do
// Microsoft Teams, onde apps NÃO acessam o áudio bruto da chamada), não faz
// sentido pagar por ASR: basta alimentar cada linha final no avatar.
//
//   const sink = createCaptionSink(libras.translate);
//   // a cada nova linha final de legenda:
//   sink.push('Bom dia, como você está?');
//
// Reusa a deduplicação de phrase-source (descarta vazias e repetidas em <3s),
// evitando que a mesma linha de legenda sinalize duas vezes.
//
// Importante: envie apenas linhas FINAIS. Legendas costumam crescer palavra a
// palavra (parciais); alimentar parciais faria o avatar repetir/atropelar.
// ---------------------------------------------------------------------------

export interface CaptionSink {
  /** Enfileira uma linha final de legenda para sinalização. */
  push(line: string): void;
}

/** Cria um sink que encaminha linhas de legenda para `translate`, deduplicadas. */
export function createCaptionSink(translate: (text: string) => void): CaptionSink {
  const emit = makeDedup(translate);
  return { push: emit };
}
