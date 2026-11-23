// ===========================================================================
// libras-kit — plugin React de tradução simultânea Português → Libras.
//
// API pública:
//   <LibrasAvatar />                 → componente principal (avatar + chat opcional)
//   <LibrasProvider config={...} />  → configuração global opt-in
//   useLibrasTranslator(options)     → hook principal (controle total)
//   useLibrasAvatar(options)         → hook só-avatar (sem ASR)
// ===========================================================================

// ── Context / Provider ──────────────────────────────────────────────────────
export { LibrasProvider, useLibrasConfig } from './ui/context/LibrasProvider';
export type { LibrasConfig, A11yOptions } from './ui/interfaces/LibrasProvider';

// ── Componente principal ────────────────────────────────────────────────────
export { LibrasAvatar } from './ui/components/LibrasAvatar';
export type {
  LibrasAvatarProps,
  LibrasAvatarClassNames,
  LibrasAvatarStyles,
  LibrasMessage,
} from './ui/interfaces/LibrasAvatar';

// ── Hooks (uso avançado / controle manual) ──────────────────────────────────
export { useLibrasTranslator } from './ui/hooks/useLibrasTranslator';
export type {
  UseLibrasTranslatorOptions,
  LibrasTranslatorApi,
  LibrasStatus,
} from './ui/hooks/useLibrasTranslator';

export { useLibrasAvatar } from './ui/hooks/useLibrasAvatar';
export type {
  UseLibrasAvatarOptions,
  LibrasAvatarApi,
  LibrasAvatarStatus,
} from './ui/hooks/useLibrasAvatar';

// ── Strings (i18n / rebranding) ─────────────────────────────────────────────
export type { LibrasStrings } from './ui/consts/strings';
export { DEFAULT_STRINGS } from './ui/consts/strings';

// ── ASR ─────────────────────────────────────────────────────────────────────
export type { AudioSource, ASROptions } from './core/asr/phrase-source';
export type {
  CloudASR,
  CloudASRCallbacks,
  ASRFactory,
} from './core/asr/cloud-asr';
export { withWebSpeechFallback } from './core/asr/with-webspeech-fallback';

// ── Adapters de plataforma ───────────────────────────────────────────────────
export * from './adapters';

// ── Núcleo (uso avançado / integração não-React) ─────────────────────────────
export { VLibrasSignRenderer } from './core/vlibras-renderer';
export type {
  VLibrasPlayerLike,
  VLibrasRendererOptions,
} from './core/vlibras-renderer';
export { createVLibrasPlayer } from './core/vlibras-loader';
export type { VLibrasLoaderOptions } from './core/vlibras-loader';
export type { SignRenderer } from './core/sign-renderer';
export { LibrasObserver } from './core/libras-observer';
export type { LibrasObserverOptions } from './core/libras-observer';
