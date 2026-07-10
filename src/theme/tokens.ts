// Ported verbatim from the web app's CSS custom properties
// (reference/running-line-web/index.html :root / [data-theme="light"]).

export type ThemeTokens = typeof darkTokens;

export const darkTokens = {
  bg: '#0B0D10',
  surface: '#12151a',
  surface2: '#181C22',
  surface3: '#1E2329',
  surface4: '#242A33',
  border: 'rgba(255,255,255,.06)',
  border2: 'rgba(255,255,255,.11)',
  border3: 'rgba(255,255,255,.18)',
  text: '#F4F5F7',
  text2: '#8B93A1',
  text3: '#5D6675',
  accent: '#6C8BFF',
  accentGlow: 'rgba(108,139,255,.18)',
  accentDim: 'rgba(108,139,255,.09)',
  sky: '#8FD3FF',
  skyDim: 'rgba(143,211,255,.08)',
  energy: '#FFB86B',
  energyDim: 'rgba(255,184,107,.08)',
  danger: '#FF6B6B',
  fav: '#FFD166',
  success: '#4ADE80',
  zone1: '#8FD3FF',
  zone2: '#4ADE80',
  zone3: '#FFD166',
  zone4: '#FFB86B',
  zone5: '#FF6B6B',
} as const;

export const lightTokens: ThemeTokens = {
  ...darkTokens,
  bg: '#F7F8FA',
  surface: '#FFFFFF',
  surface2: '#F1F3F6',
  surface3: '#E8EBF0',
  surface4: '#DDE1E8',
  border: 'rgba(0,0,0,.06)',
  border2: 'rgba(0,0,0,.10)',
  border3: 'rgba(0,0,0,.16)',
  text: '#0F1720',
  text2: '#667085',
  text3: '#98A2B3',
  accent: '#5B7CFA',
  accentGlow: 'rgba(91,124,250,.14)',
  accentDim: 'rgba(91,124,250,.08)',
  sky: '#2A9FD6',
  skyDim: 'rgba(42,159,214,.07)',
  energy: '#F59E0B',
  energyDim: 'rgba(245,158,11,.07)',
  danger: '#EF4444',
  fav: '#D97706',
  success: '#16A34A',
  // zone1-5 have no light override in the source app either — dark values carry over.
};

export const radii = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
};

export type ThemeMode = 'dark' | 'light' | 'auto';

export const THEME_STORAGE_KEY = 'rl_theme';
