// Palette "Cold Luxury x Forest" — gris chrome/argent désaturés (cold luxury) mêlés à un vert
// forêt profond et un accent ambre/bronze (forest). Remplace l'identité lime héritée de l'app
// web d'origine (voir historique git pour l'ancienne palette). Aucune couleur pure #000/#FFF —
// toujours un near-black/off-white teinté, plus premium et plus doux à l'œil.

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
  /** Lime historique de la marque — plus utilisé comme accent principal, mais réintroduit pour
   * les détails (valeurs de stats, lignes de graphique, badges) : un clin d'œil à l'identité
   * d'origine sans revenir à du "lime partout". */
  highlight: string;
  highlightDim: string;
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
  accent: '#C9973F', // ambre/bronze — CTA principal
  secondary: '#3F7256', // vert forêt profond
  tertiary: '#8B8FA3', // gris chrome/ardoise — "smoke" cold luxury
  sky: '#5B87A6', // bleu acier désaturé
  energy: '#BA6A3D', // terracotta/rouille
  danger: '#B23B2E', // rouge brique mat
  fav: '#D4A24C', // or chaud (étoiles/favoris)
  success: '#3F7256', // même vert forêt que secondary — cohérence de famille
  onAccent: '#17130E', // near-black chaud, contraste garanti sur l'accent ambre et le lime
  highlight: '#F0FB6B', // lime historique — détails uniquement (voir commentaire ThemeTokens)
} as const;

export const lightTokens: ThemeTokens = {
  bg: '#EDEAE2',
  surface: '#FBFAF7',
  surface2: '#EDEAE2',
  surface3: '#E3DFD3',
  surface4: '#D7D2C3',
  border: 'rgba(28,27,24,.08)',
  border2: 'rgba(28,27,24,.13)',
  border3: 'rgba(28,27,24,.20)',
  text: '#1C1B18',
  text2: 'rgba(28,27,24,.62)',
  text3: 'rgba(28,27,24,.45)',
  accent: brand.accent,
  accentGlow: 'rgba(201,151,63,.30)',
  accentDim: 'rgba(201,151,63,.22)',
  onAccent: brand.onAccent,
  secondary: brand.secondary,
  secondaryDim: 'rgba(63,114,86,.20)',
  tertiary: brand.tertiary,
  tertiaryDim: 'rgba(139,143,163,.20)',
  highlight: brand.highlight,
  highlightDim: 'rgba(240,251,107,.20)',
  sky: brand.sky,
  skyDim: 'rgba(91,135,166,.15)',
  energy: brand.energy,
  energyDim: 'rgba(186,106,61,.14)',
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
  bg: '#14171A',
  surface: '#1C2023',
  surface2: '#242A2E',
  surface3: '#2C3338',
  surface4: '#363E44',
  border: 'rgba(255,255,255,.09)',
  border2: 'rgba(255,255,255,.14)',
  border3: 'rgba(255,255,255,.22)',
  text: '#F1F3F4',
  text2: 'rgba(255,255,255,.66)',
  text3: 'rgba(255,255,255,.48)',
  accent: brand.accent,
  accentGlow: 'rgba(201,151,63,.30)',
  accentDim: 'rgba(201,151,63,.18)',
  onAccent: brand.onAccent,
  secondary: brand.secondary,
  secondaryDim: 'rgba(63,114,86,.24)',
  tertiary: brand.tertiary,
  tertiaryDim: 'rgba(139,143,163,.22)',
  highlight: brand.highlight,
  highlightDim: 'rgba(240,251,107,.18)',
  sky: brand.sky,
  skyDim: 'rgba(91,135,166,.18)',
  energy: brand.energy,
  energyDim: 'rgba(186,106,61,.18)',
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
  // Manrope remplace Roboto (police système Android par défaut, l'équivalent mobile d'"Inter
  // par défaut" que les outils de design déconseillent) — plus distinctif, toujours très lisible.
  body: 'Manrope_400Regular',
};

/** index.html:2991-2992 — couleurs assignées aux tracés générés/dessinés. */
export const ROUTE_COLORS = [brand.secondary, brand.sky, brand.tertiary] as const;
export const ROUTE_NAMES = ['Boucle des Crêtes', 'Sentier Sauvage', 'Boucle des Écureuils'] as const;

export type ThemeMode = 'dark' | 'light' | 'auto';

export const THEME_STORAGE_KEY = 'rl_theme';
