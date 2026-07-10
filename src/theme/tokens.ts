// Ported from the web app's CSS custom properties
// (reference/running-line-web/running_line/public/index.html:47-62).
//
// Note on fidelity: the source app does not actually have an inverted dark palette —
// its :root default (used here as darkTokens) is the cream/lime look; [data-theme="light"]
// only tweaks two component-level rules (map pill background, draw overlay), not these
// tokens. darkTokens and lightTokens are therefore intentionally identical here — this
// preserves the real product's visual identity rather than inventing a dark mode that
// doesn't exist in the source.

export type ThemeTokens = typeof darkTokens;

export const darkTokens = {
  bg: '#F5F0EF',
  surface: '#FFFFFF',
  surface2: '#F5F0EF',
  surface3: '#EDE8E7',
  surface4: '#E5E0DF',
  border: 'rgba(0,0,0,.08)',
  border2: 'rgba(0,0,0,.13)',
  border3: 'rgba(0,0,0,.20)',
  text: '#000000',
  text2: 'rgba(0,0,0,.6)',
  text3: 'rgba(0,0,0,.38)',
  accent: '#F0FB6B',
  accentGlow: 'rgba(240,251,107,.30)',
  accentDim: 'rgba(240,251,107,.22)',
  secondary: '#BEA3FE',
  secondaryDim: 'rgba(190,163,254,.22)',
  tertiary: '#FAAEE4',
  tertiaryDim: 'rgba(250,174,228,.22)',
  sky: '#60B8F5',
  skyDim: 'rgba(96,184,245,.15)',
  energy: '#FF9B50',
  energyDim: 'rgba(255,155,80,.12)',
  danger: '#E53E3E',
  fav: '#F59E0B',
  success: '#22C55E',
  zone1: '#60B8F5',
  zone2: '#22C55E',
  zone3: '#F59E0B',
  zone4: '#FF9B50',
  zone5: '#E53E3E',
} as const;

export const lightTokens: ThemeTokens = { ...darkTokens };

export const radii = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
};

export const fonts = {
  display: 'Anton_400Regular',
  mono: 'RobotoMono_400Regular',
  body: 'Roboto_400Regular',
};

/** index.html:2991-2992 — couleurs assignées aux tracés générés/dessinés. */
export const ROUTE_COLORS = [darkTokens.secondary, darkTokens.sky, darkTokens.tertiary] as const;
export const ROUTE_NAMES = ['Boucle des Crêtes', 'Sentier Sauvage', 'Boucle des Écureuils'] as const;

export type ThemeMode = 'dark' | 'light' | 'auto';

export const THEME_STORAGE_KEY = 'rl_theme';
