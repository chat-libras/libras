// ---------------------------------------------------------------------------
// Reconhecedor de fala (ASR) via Web Speech API — caminho gratuito (microfone).
//
// A Web Speech API ouve o microfone padrão e devolve transcrições parciais
// (interim) e finais em pt-BR. NÃO aceita um MediaStream de aba — o áudio de
// chamada/vídeo exige ASR na nuvem (implementado em módulo separado depois).
//
// Este wrapper encapsula os detalhes (reinício contínuo, eventos) atrás de uma
// interface simples, mantendo os componentes React desacoplados da API do
// navegador (SRP / inversão de dependência).
// ---------------------------------------------------------------------------

export interface SpeechCallbacks {
  /** Frase final reconhecida (pronta para traduzir). */
  onFinal: (text: string) => void;
  /** Transcrição parcial em andamento (para legenda "ao vivo"). */
  onInterim?: (text: string) => void;
  onError?: (error: string) => void;
  onStateChange?: (listening: boolean) => void;
}

export interface SpeechController {
  start(): void;
  stop(): void;
  readonly listening: boolean;
}

function getRecognitionCtor(): SpeechRecognitionStatic | null {
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

/** Web Speech API disponível neste navegador? */
export function isSpeechSupported(): boolean {
  return getRecognitionCtor() !== null;
}

/** Cria um reconhecedor pt-BR contínuo. Retorna null se não houver suporte. */
export function createSpeechRecognizer(
  callbacks: SpeechCallbacks,
  lang = 'pt-BR'
): SpeechController | null {
  const Ctor = getRecognitionCtor();
  if (!Ctor) return null;

  const recognition = new Ctor();
  recognition.lang = lang;
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  // `active` = intenção do usuário (ouvir). A engine de reconhecimento pára
  // sozinha após alguns segundos; reiniciamos enquanto `active` for true.
  let active = false;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript;
      if (result.isFinal) {
        const text = transcript.trim();
        if (text) callbacks.onFinal(text);
      } else {
        interim += transcript;
      }
    }
    if (interim && callbacks.onInterim) callbacks.onInterim(interim.trim());
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    // 'no-speech' e 'aborted' são recuperáveis; apenas repassa os demais.
    if (event.error !== 'no-speech' && event.error !== 'aborted') {
      callbacks.onError?.(event.error);
    }
  };

  recognition.onend = () => {
    if (active) {
      // Reinício automático para manter escuta contínua.
      try {
        recognition.start();
      } catch {
        /* start pode falhar se chamado cedo demais; ignora */
      }
    } else {
      callbacks.onStateChange?.(false);
    }
  };

  return {
    get listening() {
      return active;
    },
    start() {
      if (active) return;
      active = true;
      try {
        recognition.start();
        callbacks.onStateChange?.(true);
      } catch (err) {
        active = false;
        callbacks.onError?.(String(err));
      }
    },
    stop() {
      active = false;
      recognition.stop();
    },
  };
}
