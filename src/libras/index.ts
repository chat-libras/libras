// ===========================================================================
// libras-translator — plugin de tradução simultânea Português → Libras.
//
// Embute o avatar oficial do VLibras e traduz um áudio (microfone ou stream de
// chamada de vídeo) para Libras em tempo real, com fila sincronizada.
//
// API pública:
//   - <LibrasProvider config={...} />   → configuração global opt-in
//   - useLibrasTranslator(options)       → hook principal (controle total)
//   - <LibrasTranslator ... />           → componente pronto-para-usar
//   - <LibrasChat ... />                 → chat assimétrico (controlado pelo pai)
//   - <LibrasChatPanel ... />            → chat drop-in com estado interno
//   - useLibrasAvatar(options)           → avatar isolado (sem ASR)
// ===========================================================================

// ── Provider global (opt-in) ────────────────────────────────────────────────
export { LibrasProvider, useLibrasConfig } from './ui/LibrasProvider';
export type { LibrasConfig, A11yOptions } from './ui/LibrasProvider';

// ── Hook + componente principal ─────────────────────────────────────────────
export { useLibrasTranslator } from './ui/useLibrasTranslator';
export type {
  UseLibrasTranslatorOptions,
  LibrasTranslatorApi,
  LibrasStatus,
} from './ui/useLibrasTranslator';

export { LibrasTranslator } from './ui/LibrasTranslator';
export type {
  LibrasTranslatorProps,
  LibrasControls,
} from './ui/LibrasTranslator';

// ── Chat controlado (pai gerencia mensagens) ─────────────────────────────────
export { LibrasChat } from './ui/LibrasChat';
export type {
  LibrasChatProps,
  LibrasChatMessage,
  LibrasChatRole,
} from './ui/LibrasChat';

// ── Chat drop-in (estado interno, basta conectar ao transporte) ──────────────
export { LibrasChatPanel } from './ui/LibrasChatPanel';
export type { LibrasChatPanelProps, LibrasChatPanelRole } from './ui/LibrasChatPanel';

// ── Avatar-only (sinaliza texto pronto, sem ASR) ────────────────────────────
export { useLibrasAvatar } from './ui/useLibrasAvatar';
export type {
  UseLibrasAvatarOptions,
  LibrasAvatarApi,
  LibrasAvatarStatus,
} from './ui/useLibrasAvatar';

// ── i18n / strings ──────────────────────────────────────────────────────────
export type { LibrasStrings } from './ui/strings';
export { DEFAULT_STRINGS } from './ui/strings';

// ── ASR ─────────────────────────────────────────────────────────────────────
export type { AudioSource, ASROptions } from './core/asr/phrase-source';
export type {
  CloudASR,
  CloudASRCallbacks,
  CloudASRConfig,
} from './core/asr/cloud-asr';
export { createCloudASR } from './core/asr/cloud-asr';

// ── Adapters de plataforma (Vonage, WebRTC, legendas/Teams)
export * from './adapters';

// ── Núcleo (uso avançado / integração não-React) ─────────────────────────────
export {} from './core/vlibras-renderer';
export type {
  VLibrasPlayerLike,
  VLibrasRendererOptions,
} from './core/vlibras-renderer';
export { createVLibrasPlayer } from './core/vlibras-loader';
export type { VLibrasLoaderOptions } from './core/vlibras-loader';
export type { SignRenderer } from './core/sign-renderer';
export { LibrasObserver } from './core/libras-observer';
export type { LibrasObserverOptions } from './core/libras-observer';
