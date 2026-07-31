import { Coord, LatLng, RouteElevation } from '../../types';

/** Port fidèle de index.html:4223-4227. */
export function haversine(la1: number, lo1: number, la2: number, lo2: number): number {
  const R = 6371;
  const dL = ((la2 - la1) * Math.PI) / 180;
  const dl = ((lo2 - lo1) * Math.PI) / 180;
  const a =
    Math.sin(dL / 2) ** 2 +
    Math.cos((la1 * Math.PI) / 180) * Math.cos((la2 * Math.PI) / 180) * Math.sin(dl / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

/** index.html:4218-4222 */
export function calcDist(coords: Coord[]): number {
  let d = 0;
  for (let i = 1; i < coords.length; i++) {
    d += haversine(coords[i - 1][1], coords[i - 1][0], coords[i][1], coords[i][0]);
  }
  return d;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

/**
 * Région de carte englobant tous les points donnés, avec une marge — utilisée comme
 * `initialRegion` pour que la carte s'affiche déjà centrée sur le contenu réel au premier
 * rendu, plutôt qu'une vue générique le temps qu'un fitToCoordinates() impératif s'exécute.
 */
export function regionFromCoords(points: LatLng[], paddingFactor = 1.4): MapRegion {
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * paddingFactor, 0.01),
    longitudeDelta: Math.max((maxLng - minLng) * paddingFactor, 0.01),
  };
}

/** index.html:4193-4199 — point à `km` km de `o`, sur le cap `b` (degrés). */
export function destPoint(o: LatLng, km: number, b: number): LatLng {
  const R = 6371;
  const br = (b * Math.PI) / 180;
  const la1 = (o.lat * Math.PI) / 180;
  const lo1 = (o.lng * Math.PI) / 180;
  const la2 = Math.asin(Math.sin(la1) * Math.cos(km / R) + Math.cos(la1) * Math.sin(km / R) * Math.cos(br));
  const lo2 = lo1 + Math.atan2(Math.sin(br) * Math.sin(km / R) * Math.cos(la1), Math.cos(km / R) - Math.sin(la1) * Math.sin(la2));
  return { lat: (la2 * 180) / Math.PI, lng: (lo2 * 180) / Math.PI };
}

/** index.html:4200-4206 — 4 points formant une boucle approximative de longueur `km`, orientée `a` (cap), à l'échelle `s`. */
export function loopWpts(o: LatLng, km: number, a: number, s = 1): LatLng[] {
  const sl = (km / 3) * s;
  const p1 = destPoint(o, sl, a - 35);
  const p2 = destPoint(p1, sl * 0.95, a + 70);
  const p3 = destPoint(p2, sl * 0.7, a + 160);
  return [o, p1, p2, p3, o];
}

/**
 * Distance perpendiculaire d'un point à un segment, en km — approximation planaire (projection
 * équirectangulaire locale autour de `a`), largement suffisante à l'échelle d'un parcours running.
 */
function pointSegmentDistanceKm(p: LatLng, a: LatLng, b: LatLng): number {
  const R = 6371;
  const cosLat = Math.cos((a.lat * Math.PI) / 180);
  const toXY = (pt: LatLng) => ({
    x: ((pt.lng - a.lng) * Math.PI * R * cosLat) / 180,
    y: ((pt.lat - a.lat) * Math.PI * R) / 180,
  });
  const pxy = toXY(p);
  const bxy = toXY(b);
  const lenSq = bxy.x ** 2 + bxy.y ** 2;
  if (lenSq === 0) return Math.hypot(pxy.x, pxy.y);
  const t = Math.max(0, Math.min(1, (pxy.x * bxy.x + pxy.y * bxy.y) / lenSq));
  return Math.hypot(pxy.x - t * bxy.x, pxy.y - t * bxy.y);
}

/** Algorithme de Ramer-Douglas-Peucker — réduit une trace dense à ses points les plus significatifs. */
function douglasPeucker(points: LatLng[], toleranceKm: number): LatLng[] {
  if (points.length < 3) return points;
  let maxDist = 0;
  let splitIndex = 0;
  const first = points[0];
  const last = points[points.length - 1];
  for (let i = 1; i < points.length - 1; i++) {
    const d = pointSegmentDistanceKm(points[i], first, last);
    if (d > maxDist) {
      maxDist = d;
      splitIndex = i;
    }
  }
  if (maxDist <= toleranceKm) return [first, last];
  const left = douglasPeucker(points.slice(0, splitIndex + 1), toleranceKm);
  const right = douglasPeucker(points.slice(splitIndex), toleranceKm);
  return left.slice(0, -1).concat(right);
}

/**
 * Simplifie une trace GPX dense (des centaines de points) en une poignée de points de contrôle
 * modifiables — augmente progressivement la tolérance jusqu'à tenir sous `maxPoints`, plutôt que
 * de fixer une tolérance unique qui donnerait trop ou trop peu de points selon la longueur du tracé.
 */
export function simplifyToWaypoints(points: LatLng[], maxPoints = 20): LatLng[] {
  if (points.length <= maxPoints) return points;
  let tolerance = 0.008;
  let result = points;
  for (let i = 0; i < 25 && result.length > maxPoints; i++) {
    result = douglasPeucker(points, tolerance);
    tolerance *= 1.6;
  }
  return result.length >= 2 ? result : [points[0], points[points.length - 1]];
}

/** index.html:4228-4236 */
export function analyzeElevation(coords: Coord[]): RouteElevation {
  const elev = coords.map((c) => c[2] || 0);
  let up = 0;
  let dn = 0;
  for (let i = 1; i < elev.length; i++) {
    const d = elev[i] - elev[i - 1];
    if (d > 0) up += d;
    else dn += Math.abs(d);
  }
  return {
    elevations: elev,
    totalAscent: Math.round(up),
    totalDescent: Math.round(dn),
    maxEle: Math.round(Math.max(...elev)),
    minEle: Math.round(Math.min(...elev)),
  };
}

/** index.html:4208-4217 — deux tracés sont "le même" s'ils passent à <400m à mi-parcours et au 1er quart. */
export function routesSimilar(
  r1: { distKm: number; coords: Coord[] },
  r2: { distKm: number; coords: Coord[] }
): boolean {
  if (Math.abs(r1.distKm - r2.distKm) / Math.max(r1.distKm, 0.1) > 0.1) return false;
  const mid1 = r1.coords[Math.floor(r1.coords.length / 2)];
  const mid2 = r2.coords[Math.floor(r2.coords.length / 2)];
  const q1 = r1.coords[Math.floor(r1.coords.length / 4)];
  const q2 = r2.coords[Math.floor(r2.coords.length / 4)];
  const midD = haversine(mid1[1], mid1[0], mid2[1], mid2[0]);
  const qD = haversine(q1[1], q1[0], q2[1], q2[0]);
  return midD < 0.4 && qD < 0.4;
}
