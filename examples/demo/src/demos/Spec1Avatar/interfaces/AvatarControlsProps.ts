import type { LibrasTranslatorApi } from 'libras-translator';

export interface AvatarControlsProps {
  libras: LibrasTranslatorApi;
  text: string;
  onTextChange: (text: string) => void;
  onSend: () => void;
}
