// ---------------------------------------------------------------------------
// Contratos públicos do subsistema de ASR de nuvem.
//
// Este arquivo define APENAS interfaces e tipos — sem implementação,
// sem dependência de nenhum provedor específico.
//
// Para injetar um provedor, use ASROptions com provider: 'custom':
//   asr={{ provider: 'custom', factory: myFactory }}
// ---------------------------------------------------------------------------

export interface CloudASRCallbacks {
  onTranscript: (text: string, final: boolean) => void;
  onError: (error: string) => void;
}

export interface CloudASR {
  start(stream: MediaStream): Promise<void>;
  stop(): void;
}

/**
 * Fábrica de ASR: recebe callbacks e devolve uma instância de CloudASR.
 * Implemente esta assinatura para integrar qualquer provedor sem modificar o core.
 *
 * @example
 * const myFactory: ASRFactory = (cb) => ({
 *   async start(stream) { await mySDK.connect(stream, cb); },
 *   stop() { mySDK.disconnect(); },
 * });
 * <LibrasTranslator asr={{ provider: 'custom', factory: myFactory }} />
 */
export type ASRFactory = (callbacks: CloudASRCallbacks) => CloudASR;
