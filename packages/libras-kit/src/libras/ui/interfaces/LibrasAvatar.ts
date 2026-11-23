import type React from 'react';
import type { VLibrasLoaderOptions } from '../../core/vlibras-loader';
import type { AudioSource, ASROptions } from '../../core/asr/phrase-source';
import type { LibrasStrings } from '../consts/strings';

export interface LibrasMessage {
  id: string;
  text: string;
  source: 'speech' | 'typed';
}

export interface LibrasAvatarClassNames {
  root?: string;
  avatar?: string;
  chat?: string;
  messages?: string;
  message?: string;
  input?: string;
}

export interface LibrasAvatarStyles {
  root?: React.CSSProperties;
  avatar?: React.CSSProperties;
  chat?: React.CSSProperties;
  messages?: React.CSSProperties;
  message?: React.CSSProperties;
  input?: React.CSSProperties;
}

export interface LibrasAvatarProps {
  audio?: AudioSource;
  asr?: ASROptions;
  autoStart?: boolean;
  vlibras?: VLibrasLoaderOptions;
  speed?: number;
  showChat?: boolean;
  onSend?: (text: string) => void;
  onTranscript?: (text: string) => void;
  classNames?: LibrasAvatarClassNames;
  styles?: LibrasAvatarStyles;
  strings?: Partial<LibrasStrings>;
}
