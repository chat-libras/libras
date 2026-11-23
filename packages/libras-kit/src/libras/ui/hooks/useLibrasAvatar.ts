import { useCallback, useRef, useState } from 'react';
import { createVLibrasPlayer, resetVLibrasPlayer, type VLibrasLoaderOptions } from '../../core/vlibras-loader';
import { VLibrasSignRenderer } from '../../core/vlibras-renderer';
import type { SignRenderer } from '../../core/sign-renderer';
import { useLibrasConfig, useLibrasRendererRef } from '../context/LibrasProvider';

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

/**
 * Hook de baixo nível que controla apenas o avatar (sem ASR).
 * Use quando precisar sinalizar texto de outra fonte (legenda, teclado, stream já transcrito).
 *
 * @example
 * const { containerRef, translate } = useLibrasAvatar();
 * <div ref={containerRef} style={{ width: 320, height: 240 }} />
 * <button onClick={() => translate('Bom dia')}>Sinalizar</button>
 */
export function useLibrasAvatar(options: UseLibrasAvatarOptions = {}): LibrasAvatarApi {
  const ctx = useLibrasConfig();
  const { vlibras = ctx.vlibras, speed: initialSpeed = 1, onReady } = options;

  // Renderer compartilhado via contexto: isolado por LibrasProvider, ou global singleton
  // quando não há provider (garante um único listener no player Unity por subárvore).
  const rendererRef = useLibrasRendererRef();

  const [status, setStatus] = useState<LibrasAvatarStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [speed, setSpeedState] = useState(initialSpeed);

  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  const setSpeed = useCallback((value: number) => {
    setSpeedState(value);
    rendererRef.current?.setSpeed(value);
  }, [rendererRef]);

  const translate = useCallback((text: string) => {
    rendererRef.current?.play(text);
  }, [rendererRef]);

  const loadStartedRef = useRef(false);

  const attachContainer = useCallback((el: HTMLDivElement | null) => {
    if (!el) {
      loadStartedRef.current = false;
      rendererRef.current = null;
      resetVLibrasPlayer();
      setStatus('loading');
      return;
    }
    if (loadStartedRef.current) return;
    loadStartedRef.current = true;

    createVLibrasPlayer(el, vlibras)
      .then((player) => {
        // Cria o renderer apenas se ainda não existe (evita duplicar listeners
        // quando dois componentes montam na mesma subárvore de provider).
        if (!rendererRef.current) {
          rendererRef.current = new VLibrasSignRenderer(player, { settleMs: 250 });
        }
        rendererRef.current.setSpeed(speed);
        rendererRef.current.clear();
        setStatus('ready');
        onReadyRef.current?.();
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : String(e));
        setStatus('error');
      });
    // vlibras omitido das deps: o player é um singleton que não pode ser recriado
    // após o primeiro mount — mudar as opções de loader não reinicia o Unity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rendererRef]);

  return { containerRef: attachContainer, status, error, translate, speed, setSpeed, renderer: rendererRef.current };
}
