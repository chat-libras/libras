/** Callbacks invocados pelo provedor de ASR durante a transcrição. */
export interface CloudASRCallbacks {
    /** `final=false` para resultados parciais; `final=true` quando a frase está completa. */
    onTranscript: (text: string, final: boolean) => void;
    /** Chamado quando o provedor encontra um erro (rede, permissão, cota). */
    onError: (error: string) => void;
}
/**
 * Instância de um provedor de ASR de nuvem. Criada por {@link ASRFactory}.
 */
export interface CloudASR {
    /** Inicia a transcrição consumindo o MediaStream fornecido. */
    start(stream: MediaStream): Promise<void>;
    /** Para a transcrição e libera recursos. */
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
