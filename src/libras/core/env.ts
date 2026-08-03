// ---------------------------------------------------------------------------
// Centraliza acesso às variáveis de ambiente da lib.
// Nunca use import.meta.env diretamente fora deste arquivo.
// ---------------------------------------------------------------------------

export interface LibrasEnv {
  deepgramKey: string | undefined;
  vlibrasTranslatorUrl: string;
  vlibrasBundleUrl: string;
}

const TRANSLATOR_DEFAULT = 'https://traducao2.vlibras.gov.br/translate';
const BUNDLE_DEFAULT = '/vlibras/vlibras.js';

export function getLibrasEnv(): LibrasEnv {
  return {
    deepgramKey: (import.meta.env['VITE_DEEPGRAM_KEY'] as string | undefined) || undefined,
    vlibrasTranslatorUrl:
      (import.meta.env['VITE_VLIBRAS_TRANSLATOR_URL'] as string | undefined) ||
      TRANSLATOR_DEFAULT,
    vlibrasBundleUrl:
      (import.meta.env['VITE_VLIBRAS_BUNDLE_URL'] as string | undefined) || BUNDLE_DEFAULT,
  };
}
