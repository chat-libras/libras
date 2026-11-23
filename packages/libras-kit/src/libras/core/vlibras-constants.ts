// Constantes compartilhadas do player VLibras.
// Importe daqui — não repita estas strings em outros arquivos do core.

/** Endpoint público PT→glosa (CORS habilitado, sem auth). */
export const VLIBRAS_TRANSLATOR_URL = 'https://traducao2.vlibras.gov.br/translate';

/** Caminho padrão do bundle do player (window.VLibras), servido localmente. */
export const VLIBRAS_BUNDLE_URL = '/vlibras/vlibras.js';

/**
 * CDN dos assets Unity (UnityLoader.js, Build/).
 * Fixado em SHA de commit para evitar que uma mudança na branch quebre os assets.
 * Para atualizar: pegue o novo SHA em https://github.com/spbgovbr-vlibras/vlibras-portal
 */
export const VLIBRAS_TARGET_PATH =
  'https://cdn.jsdelivr.net/gh/spbgovbr-vlibras/vlibras-portal@02c29088381b2c779bbbc5fde821d809f532c474/app/target';
