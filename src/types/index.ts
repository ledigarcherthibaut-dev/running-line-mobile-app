/** Types métier portés depuis la logique de reference/running-line-web/running_line/public/index.html. */

/** [lng, lat, ele?] — convention GeoJSON utilisée par BRouter et tout le reste de l'app. */
export type Coord = [number, number, number?];

export type Terrain = 'road' | 'mixed' | 'trail' | 'any';
export type Level = 'beginner' | 'intermediate' | 'advanced';

export interface RouteElevation {
  elevations: number[];
  totalAscent: number;
  totalDescent: number;
  maxEle: number;
  minEle: number;
}

export interface TrailPurity {
  pct: number;
  label: string;
  cssClass: 'good' | 'warn' | 'bad';
}

export interface GeneratedRoute {
  coords: Coord[];
  elevation: RouteElevation;
  distKm: number;
  name: string;
  color?: string;
  purity?: TrailPurity | null;
}

export interface SavedRoute {
  id: string;
  name: string;
  isFav: boolean;
  distKm: number;
  elevation: RouteElevation;
  terrain: Terrain;
  coords: Coord[];
  isPublic: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  level: Level;
  preferred_terrain: Terrain;
  preferred_dist: number;
  theme: 'dark' | 'light' | 'auto';
  vma?: number | null;
  fc_max?: number | null;
  updated_at: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}
