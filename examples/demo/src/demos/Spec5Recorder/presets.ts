export const PRESETS = [
  { id: 'youtube', label: 'YouTube',        note: '16:9', canvasW: 1280, canvasH: 720,  avatarPct: 0.25, drawMode: 'cover'     },
  { id: 'reels',   label: 'Reels / TikTok', note: '9:16', canvasW: 1280, canvasH: 1280, avatarPct: 0.40, drawMode: 'fitHeight' },
  { id: 'square',  label: 'Feed',           note: '1:1',  canvasW: 720,  canvasH: 720,  avatarPct: 0.28, drawMode: 'cover'     },
] as const;

export type PresetId = typeof PRESETS[number]['id'];
export type Preset   = typeof PRESETS[number];

export const ASPECT: Record<PresetId, string> = {
  youtube: '16 / 9',
  reels:   '9 / 16',
  square:  '1 / 1',
};
