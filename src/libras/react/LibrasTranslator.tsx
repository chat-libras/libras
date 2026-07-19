import { useLibrasTranslator, type UseLibrasTranslatorOptions } from './useLibrasTranslator';

// ---------------------------------------------------------------------------
// Componente pronto-para-usar: renderiza o avatar do VLibras traduzindo o áudio
// dado. Ideal para embutir num app de chamada de vídeo (telemedicina).
//
//   <LibrasTranslator
//     audio={{ kind: 'stream', stream: remoteAudioStream }}
//     asr={{ provider: 'deepgram', apiKey: KEY }}
//     showCaptions
//   />
// ---------------------------------------------------------------------------

export interface LibrasTranslatorProps extends UseLibrasTranslatorOptions {
  className?: string;
  style?: React.CSSProperties;
  /** Mostra a transcrição parcial sobre o avatar. */
  showCaptions?: boolean;
}

export function LibrasTranslator({
  className,
  style,
  showCaptions,
  ...options
}: LibrasTranslatorProps) {
  const libras = useLibrasTranslator(options);

  return (
    <div className={`libras-translator ${className ?? ''}`} style={style}>
      <div ref={libras.containerRef} className="libras-translator__stage" />

      {libras.status === 'loading' && (
        <div className="libras-translator__overlay">Carregando avatar…</div>
      )}
      {libras.status === 'error' && (
        <div className="libras-translator__overlay libras-translator__overlay--error">
          {libras.error}
        </div>
      )}
      {showCaptions && libras.interim && (
        <div className="libras-translator__caption">{libras.interim}</div>
      )}
    </div>
  );
}
