// Light palette ported from the web app's CSS custom properties
// (reference/running-line-web/running_line/public/index.html:47-62) — the cream/lime look
// is the source app's only theme. The dark palette below is a genuine inverted theme built
// for the mobile app (bg/surface/text/border inverted, brand accent colors kept identical).

export interface ThemeTokens {
  bg: string;
  surface: string;
  surface2: string;
  surface3: string;
  surface4: string;
  border: string;
  border2: string;
  border3: string;
  text: string;
  text2: string;
  text3: string;
  accent: string;
  accentGlow: string;
  accentDim: string;
  /** Couleur de texte/icône fixe pour tout élément posé sur un fond `accent` plein (lime clair
   * dans les deux thèmes) — `text`/`bg` sont trop clairs dans un des deux thèmes pour rester lisibles. */
  onAccent: string;
  secondary: string;
  secondaryDim: string;
  tertiary: string;
  tertiaryDim: string;
  sky: string;
  skyDim: string;
  energy: string;
  energyDim: string;
  danger: string;
  fav: string;
  success: string;
  zone1: string;
  zone2: string;
  zone3: string;
  zone4: string;
  zone5: string;
}

/** Couleurs de marque partagées entre les deux thèmes (identiques en clair et en sombre). */
const brand = {
  accent: '#F0FB6B',
  secondary: '#BEA3FE',
  tertiary: '#FAAEE4',
  sky: '#60B8F5',
  energy: '#FF9B50',
  danger: '#E53E3E',
  fav: '#F59E0B',
  success: '#22C55E',
  onAccent: '#101215',
} as const;

export const lightTokens: ThemeTokens = {
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
  text3: 'rgba(0,0,0,.45)',
  accent: brand.accent,
  accentGlow: 'rgba(240,251,107,.30)',
  accentDim: 'rgba(240,251,107,.22)',
  onAccent: brand.onAccent,
  secondary: brand.secondary,
  secondaryDim: 'rgba(190,163,254,.22)',
  tertiary: brand.tertiary,
  tertiaryDim: 'rgba(250,174,228,.22)',
  sky: brand.sky,
  skyDim: 'rgba(96,184,245,.15)',
  energy: brand.energy,
  energyDim: 'rgba(255,155,80,.12)',
  danger: brand.danger,
  fav: brand.fav,
  success: brand.success,
  zone1: brand.sky,
  zone2: brand.success,
  zone3: brand.fav,
  zone4: brand.energy,
  zone5: brand.danger,
} as const;

/** Thème sombre réel — surfaces/texte/bordures inversés, couleurs de marque conservées. */
export const darkTokens: ThemeTokens = {
  bg: '#101215',
  surface: '#191C21',
  surface2: '#20242A',
  surface3: '#282D34',
  surface4: '#31363F',
  border: 'rgba(255,255,255,.09)',
  border2: 'rgba(255,255,255,.14)',
  border3: 'rgba(255,255,255,.22)',
  text: '#FFFFFF',
  text2: 'rgba(255,255,255,.66)',
  text3: 'rgba(255,255,255,.48)',
  accent: brand.accent,
  accentGlow: 'rgba(240,251,107,.30)',
  accentDim: 'rgba(240,251,107,.18)',
  onAccent: brand.onAccent,
  secondary: brand.secondary,
  secondaryDim: 'rgba(190,163,254,.22)',
  tertiary: brand.tertiary,
  tertiaryDim: 'rgba(250,174,228,.22)',
  sky: brand.sky,
  skyDim: 'rgba(96,184,245,.18)',
  energy: brand.energy,
  energyDim: 'rgba(255,155,80,.18)',
  danger: brand.danger,
  fav: brand.fav,
  success: brand.success,
  zone1: brand.sky,
  zone2: brand.success,
  zone3: brand.fav,
  zone4: brand.energy,
  zone5: brand.danger,
};

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
export const ROUTE_COLORS = [brand.secondary, brand.sky, brand.tertiary] as const;
export const ROUTE_NAMES = ['Boucle des Crêtes', 'Sentier Sauvage', 'Boucle des Écureuils'] as const;

export type ThemeMode = 'dark' | 'light' | 'auto';

export const THEME_STORAGE_KEY = 'rl_theme';
