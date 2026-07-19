import type { LibrasTranslatorApi } from '../../libras';

// Props do formulário de tradução manual de texto.
export interface ManualFormProps {
  status: LibrasTranslatorApi['status'];
  onTranslate: LibrasTranslatorApi['translate'];
}
