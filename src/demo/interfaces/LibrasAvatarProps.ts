import type { LibrasTranslatorApi } from '../../libras';

// Props do avatar de Libras (palco do player e overlays de status).
export interface LibrasAvatarProps {
  containerRef: LibrasTranslatorApi['containerRef'];
  status: LibrasTranslatorApi['status'];
  error: LibrasTranslatorApi['error'];
}
