import { useCallback, useRef, useState } from 'react';
import { createVLibrasPlayer, resetVLibrasPlayer, type VLibrasLoaderOptions } from '../core/vlibras-loader';
import { VLibrasSignRenderer } from '../core/vlibras-renderer';
import type { SignRenderer } from '../core/sign-renderer';
import { useLibrasConfig } from './LibrasProvider';

// ---------------------------------------------------------------------------
// Hook enxuto do AVATAR: monta o player do VLibras num container e sinaliza um
// TEXTO (fila sincronizada), sem nenhuma captura de áudio/ASR.
//
// É a base do `useLibrasTranslator` (que só acrescenta a camada de ASR) e é o
// que o lado CLIENTE do <LibrasChat> usa — ele já recebe o texto pronto do
// outro lado e só precisa sinalizar.
//
//   const avatar = useLibrasAvatar();
//   avatar.translate('Bom dia');            // sinaliza (enfileira)
//   return <div ref={avatar.containerRef} className="avatar" />;
// ---------------------------------------------------------------------------

export type LibrasAvatarStatus = 'loading' | 'ready' | 'error';

export interface UseLibrasAvatarOptions {
  /** Opções de carregamento do VLibras (bundleUrl, targetPath, avatar). */
  vlibras?: VLibrasLoaderOptions;
  /** Velocidade da sinalização do avatar (1 = normal). Default: 1. */
  speed?: number;
  /** Chamado assim que o avatar termina de carregar (fica 'ready'). */
  onReady?: () => void;
}

export interface LibrasAvatarApi {
  /** Anexe a um <div> onde o avatar será renderizado (callback ref ou ref object). */
  containerRef: React.RefCallback<HTMLDivElement>;
  status: LibrasAvatarStatus;
  error: string | null;
  /** Sinaliza um texto (enfileira; frases não se atropelam). */
  translate: (text: string) => void;
  /** Velocidade atual da sinalização (1 = normal). */
  speed: number;
  /** Ajusta a velocidade da sinalização ao vivo. */
  setSpeed: (speed: number) => void;
  /** Renderer interno — use para integrar com LibrasObserver (uso avançado). */
  renderer: SignRenderer | null;
}

// Singleton: o Unity/WebGL do VLibras é pesado e só deve existir uma vez
// (StrictMode monta 2×; múltiplos renderers = múltiplos listeners = repetição).
let rendererSingleton: VLibrasSignRenderer | null = null;

export function useLibrasAvatar(options: UseLibrasAvatarOptions = {}): LibrasAvatarApi {
  const ctx = useLibrasConfig();
  const { vlibras = ctx.vlibras, speed: initialSpeed = 1, onReady } = options;

  const [status, setStatus] = useState<LibrasAvatarStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [speed, setSpeedState] = useState(initialSpeed);

  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  const setSpeed = useCallback((value: number) => {
    setSpeedState(value);
    rendererSingleton?.setSpeed(value);
  }, []);

  const translate = useCallback((text: string) => {
    rendererSingleton?.play(text);
  }, []);

  const loadStartedRef = useRef(false);

  const attachContainer = useCallback((el: HTMLDivElement | null) => {
    if (!el) {
      loadStartedRef.current = false;
      rendererSingleton = null;
      resetVLibrasPlayer();
      setStatus('loading');
      return;
    }
    if (loadStartedRef.current) return;
    loadStartedRef.current = true;

    createVLibrasPlayer(el, vlibras)
      .then((player) => {
        rendererSingleton = new VLibrasSignRenderer(player, { settleMs: 250 });
        rendererSingleton.setSpeed(speed);
        rendererSingleton.clear();
        setStatus('ready');
        onReadyRef.current?.();
      })
      .catch((e) => {
        setError(String(e?.message ?? e));
        setStatus('error');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { containerRef: attachContainer, status, error, translate, speed, setSpeed, renderer: rendererSingleton };
}
