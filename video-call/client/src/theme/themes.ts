export interface Theme {
  name: 'dark' | 'light';
  bg: {
    primary: string;
    secondary: string;
    tertiary: string;
    card: string;
    tile: string;
  };
  border: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  btn: {
    active: { bg: string; text: string; hover: string };
    inactive: { bg: string; text: string; hover: string };
    danger: { bg: string; text: string; hover: string };
    accent: { bg: string; text: string; hover: string };
  };
  chat: {
    mine: { bg: string; color: string };
    theirs: { bg: string; color: string };
    input: string;
  };
  video: {
    tile: string;
    placeholder: string;
    pinnedBorder: string;
  };
}

export const darkTheme: Theme = {
  name: 'dark',
  bg: {
    primary: '#0f172a',
    secondary: '#1e293b',
    tertiary: '#111827',
    card: '#1f2937',
    tile: '#111827',
  },
  border: '#334155',
  text: {
    primary: '#f1f5f9',
    secondary: '#94a3b8',
    muted: '#475569',
  },
  btn: {
    active:   { bg: '#1e40af', text: '#bfdbfe', hover: '#1d4ed8' },
    inactive: { bg: '#1e293b', text: '#475569', hover: '#334155' },
    danger:   { bg: '#dc2626', text: '#fff',    hover: '#b91c1c' },
    accent:   { bg: '#0f766e', text: '#99f6e4', hover: '#0d9488' },
  },
  chat: {
    mine:   { bg: '#2563eb', color: '#fff' },
    theirs: { bg: '#374151', color: '#f9fafb' },
    input:  '#111827',
  },
  video: {
    tile: '#111827',
    placeholder: '#475569',
    pinnedBorder: '#2563eb',
  },
};

export const lightTheme: Theme = {
  name: 'light',
  bg: {
    primary: '#f1f5f9',
    secondary: '#ffffff',
    tertiary: '#f8fafc',
    card: '#ffffff',
    tile: '#e2e8f0',
  },
  border: '#cbd5e1',
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    muted: '#94a3b8',
  },
  btn: {
    active:   { bg: '#2563eb', text: '#fff',    hover: '#1d4ed8' },
    inactive: { bg: '#e2e8f0', text: '#64748b', hover: '#cbd5e1' },
    danger:   { bg: '#dc2626', text: '#fff',    hover: '#b91c1c' },
    accent:   { bg: '#0d9488', text: '#fff',    hover: '#0f766e' },
  },
  chat: {
    mine:   { bg: '#2563eb', color: '#fff' },
    theirs: { bg: '#e2e8f0', color: '#0f172a' },
    input:  '#f8fafc',
  },
  video: {
    tile: '#e2e8f0',
    placeholder: '#94a3b8',
    pinnedBorder: '#2563eb',
  },
};
