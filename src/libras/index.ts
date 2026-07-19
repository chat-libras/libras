// ===========================================================================
// libras-translator — plugin de tradução simultânea Português → Libras.
//
// Embute o avatar oficial do VLibras e traduz um áudio (microfone ou stream de
// chamada de vídeo) para Libras em tempo real, com fila sincronizada.
//
// API pública:
//   - useLibrasTranslator(options)   → hook (controle total)
//   - <LibrasTranslator ... />       → componente pronto-para-usar
//   - VLibrasSignRenderer            → renderer com fila sincronizada (avançado)
//   - createVLibrasPlayer            → carregador do player (avançado)
// ===========================================================================

export { useLibrasTranslator } from './react/useLibrasTranslator';
export type {
  UseLibrasTranslatorOptions,
  LibrasTranslatorApi,
  LibrasStatus,
} from './react/useLibrasTranslator';

export { LibrasTranslator } from './react/LibrasTranslator';
export type { LibrasTranslatorProps } from './react/LibrasTranslator';

export type { AudioSource, ASROptions } from './core/asr/phrase-source';

// Núcleo (uso avançado / integração não-React)
export { VLibrasSignRenderer } from './core/vlibras-renderer';
export type { VLibrasPlayerLike, VLibrasRendererOptions } from './core/vlibras-renderer';
export { createVLibrasPlayer } from './core/vlibras-loader';
export type { VLibrasLoaderOptions } from './core/vlibras-loader';
export type { SignRenderer } from './core/sign-renderer';
