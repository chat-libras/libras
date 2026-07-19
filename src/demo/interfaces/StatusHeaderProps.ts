import type { LibrasTranslatorApi } from '../../libras';

// Props do cabeçalho da demo (título + selo de status).
export interface StatusHeaderProps {
  status: LibrasTranslatorApi['status'];
  listening: boolean;
}
