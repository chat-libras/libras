// ---------------------------------------------------------------------------
// Centraliza acesso às variáveis de ambiente da lib.
// Nunca use import.meta.env diretamente fora deste arquivo.
// Nota: este utilitário é apenas para uso interno no demo/examples.
// A lib pública configura tudo via props — não via variáveis de ambiente.
// ---------------------------------------------------------------------------

export interface LibrasEnv {
  vlibrasTranslatorUrl: string;
  vlibrasBundleUrl: string;
}

const TRANSLATOR_DEFAULT = 'https://traducao2.vlibras.gov.br/translate';
const BUNDLE_DEFAULT = '/vlibras/vlibras.js';

export function getLibrasEnv(): LibrasEnv {
  return {
    vlibrasTranslatorUrl:
      (import.meta.env['VITE_VLIBRAS_TRANSLATOR_URL'] as string | undefined) ||
      TRANSLATOR_DEFAULT,
    vlibrasBundleUrl:
      (import.meta.env['VITE_VLIBRAS_BUNDLE_URL'] as string | undefined) || BUNDLE_DEFAULT,
  };
}
