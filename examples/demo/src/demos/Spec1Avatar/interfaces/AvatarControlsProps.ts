import type { LibrasTranslatorApi } from 'libras-kit';

export interface AvatarControlsProps {
  libras: LibrasTranslatorApi;
  text: string;
  onTextChange: (text: string) => void;
  onSend: () => void;
}
