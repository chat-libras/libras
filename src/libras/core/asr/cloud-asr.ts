// ---------------------------------------------------------------------------
// ASR de nuvem (para áudio de aba/chamada) — PLUGÁVEL.
//
// A Web Speech API só ouve o microfone; o áudio capturado de uma aba
// (tabCapture) precisa de um serviço de streaming na nuvem. Aqui definimos uma
// interface única e provedores intercambiáveis (princípio Open/Closed).
//
// Provedores:
//   'none'     → não configurado; emite um erro claro (padrão do MVP).
//   'deepgram' → esqueleto funcional; requer API key (custo por minuto).
//
// Configure em asr-config.ts. Trocar de provedor não afeta o offscreen.
// ---------------------------------------------------------------------------

export interface CloudASRCallbacks {
  onTranscript: (text: string, final: boolean) => void;
  onError: (error: string) => void;
}

export interface CloudASRConfig {
  provider: 'none' | 'deepgram';
  apiKey?: string;
  lang?: string;
}

export interface CloudASR {
  start(stream: MediaStream): Promise<void>;
  stop(): void;
}

export function createCloudASR(config: CloudASRConfig, cb: CloudASRCallbacks): CloudASR {
  switch (config.provider) {
    case 'deepgram':
      return new DeepgramASR(config, cb);
    case 'none':
    default:
      return new NotConfiguredASR(cb);
  }
}

// Provedor padrão: deixa claro que falta configurar, sem quebrar o fluxo.
class NotConfiguredASR implements CloudASR {
  constructor(private cb: CloudASRCallbacks) {}
  async start(): Promise<void> {
    this.cb.onError(
      'ASR de nuvem não configurado. Passe asr={{ provider: "deepgram", apiKey }} ' +
        '(ver docs/GUIA.md) para traduzir o áudio da chamada. O microfone funciona sem isso.'
    );
  }
  stop(): void {}
}

// Esqueleto Deepgram (streaming via WebSocket). Envia áudio containerizado
// (MediaRecorder/webm-opus) e recebe transcrições parciais/finais.
class DeepgramASR implements CloudASR {
  private socket: WebSocket | null = null;
  private recorder: MediaRecorder | null = null;

  constructor(private config: CloudASRConfig, private cb: CloudASRCallbacks) {}

  async start(stream: MediaStream): Promise<void> {
    const { apiKey, lang = 'pt-BR' } = this.config;
    if (!apiKey) {
      this.cb.onError('Deepgram selecionado mas sem API key em asr-config.ts.');
      return;
    }

    const params = new URLSearchParams({
      language: lang,
      model: 'nova-2',
      interim_results: 'true',
      punctuate: 'true',
      encoding: 'opus',
    });
    // Autenticação no browser: subprotocolo ['token', <key>].
    this.socket = new WebSocket(
      `wss://api.deepgram.com/v1/listen?${params.toString()}`,
      ['token', apiKey]
    );

    this.socket.onopen = () => {
      this.recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      this.recorder.ondataavailable = (e) => {
        if (e.data.size > 0 && this.socket?.readyState === WebSocket.OPEN) {
          this.socket.send(e.data);
        }
      };
      this.recorder.start(250); // envia chunks a cada 250ms
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string);
        const alt = data?.channel?.alternatives?.[0];
        const text: string | undefined = alt?.transcript;
        if (text) this.cb.onTranscript(text, Boolean(data.is_final));
      } catch {
        /* ignora frames não-JSON */
      }
    };

    this.socket.onerror = () => this.cb.onError('Erro na conexão com o Deepgram.');
  }

  stop(): void {
    this.recorder?.stop();
    this.recorder = null;
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'CloseStream' }));
    }
    this.socket?.close();
    this.socket = null;
  }
}
