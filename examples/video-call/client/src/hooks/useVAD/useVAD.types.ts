export interface VADOptions {
  /** RMS 0–1. Acima → falando. Default: 0.015 */
  threshold?: number;
  /** ms silêncio para considerar que parou de falar. Default: 800 */
  silenceMs?: number;
  onSpeakStart: (peerId: string) => void;
  onSpeakStop: (peerId: string) => void;
}
