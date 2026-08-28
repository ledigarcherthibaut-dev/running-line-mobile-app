import { GeneratedRoute, LatLng, Terrain } from '../../types';
import { ROUTE_COLORS, ROUTE_NAMES } from '../../theme/tokens';
import { analyzeElevation, bearingBetween, calcDist, destPoint, loopWpts, routesSimilar } from './geo';
import { analyzeTrailPurity, featureToCoords, fetchBRouterMultiPoint, getBRouterProfile } from './brouter';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type GenerateProgress = (step: number, message: string) => void;

interface DirectAttempt {
  coords: GeneratedRoute['coords'];
  elevation: GeneratedRoute['elevation'];
  distKm: number;
  purity: GeneratedRoute['purity'];
}

async function routeViaPoints(points: LatLng[], profile: string, isTrail: boolean): Promise<DirectAttempt> {
  const feat = await fetchBRouterMultiPoint(points, profile);
  const coords = featureToCoords(feat);
  return {
    coords,
    elevation: analyzeElevation(coords),
    distKm: calcDist(coords),
    purity: isTrail ? analyzeTrailPurity(feat) : null,
  };
}

function scoreAttempt(a: DirectAttempt, targetKm: number, targetDP: number, isTrail: boolean): number {
  const dErr = Math.abs(a.distKm - targetKm) / targetKm;
  const eErr = Math.abs(a.elevation.totalAscent - targetDP) / Math.max(targetDP, 1);
  const purityPenalty = isTrail && a.purity ? Math.max(0, a.purity.pct - 30) / 100 : 0;
  return dErr * 2 + eErr + purityPenalty;
}

/**
 * Itinéraire A→B tenant compte de la distance/du dénivelé demandés : BRouter route toujours le
 * chemin le plus efficace entre deux points, donc pour allonger le trajet jusqu'à la distance
 * cible on le fait passer par un point de détour (perpendiculaire au trajet direct, à mi-chemin),
 * dont l'amplitude est corrigée à chaque tentative comme la branche boucle ci-dessous — pas de
 * paramètre BRouter natif pour "vise telle distance" sur un point à point.
 */
export async function generateDirectRoute(
  start: LatLng,
  end: LatLng,
  terrain: Terrain,
  targetKm?: number,
  targetDP?: number
): Promise<GeneratedRoute> {
  const profile = getBRouterProfile(terrain);
  const isTrail = terrain === 'trail';
  const direct = await routeViaPoints([start, end], profile, isTrail);

  // Pas de cible, ou trajet direct déjà au moins aussi long que demandé (on ne peut pas
  // raccourcir en-dessous du plus court chemin réel tout en rejoignant le même point B).
  if (!targetKm || targetKm <= direct.distKm * 1.05) {
    return toGeneratedRoute(direct);
  }

  const bearing = bearingBetween(start, end);
  const mid: LatLng = { lat: (start.lat + end.lat) / 2, lng: (start.lng + end.lng) / 2 };
  const dp = targetDP ?? 0;

  let best = direct;
  let bestScore = scoreAttempt(direct, targetKm, dp, isTrail);
  let offsetKm = Math.max((targetKm - direct.distKm) / 2, 0.3);

  for (let attempt = 0; attempt < 5; attempt++) {
    const side = attempt % 2 === 0 ? 90 : -90; // alterne de côté si un côté est peu praticable
    const via = destPoint(mid, offsetKm, bearing + side);
    let candidate: DirectAttempt;
    try {
      candidate = await routeViaPoints([start, via, end], profile, isTrail);
    } catch {
      offsetKm *= 0.7;
      await delay(120);
      continue;
    }

    const score = scoreAttempt(candidate, targetKm, dp, isTrail);
    if (score < bestScore) {
      best = candidate;
      bestScore = score;
    }

    const dErr = (candidate.distKm - targetKm) / targetKm;
    if (Math.abs(dErr) < 0.1) break;
    offsetKm = Math.max(offsetKm * (dErr < 0 ? 1.4 : 0.6), 0.2);
    await delay(120);
  }

  return toGeneratedRoute(best);
}

function toGeneratedRoute(a: DirectAttempt): GeneratedRoute {
  return { coords: a.coords, elevation: a.elevation, distKm: a.distKm, name: 'Itinéraire Direct', purity: a.purity };
}

/**
 * Port fidèle de la branche boucle de generateRoutes (index.html:4921-4993) :
 * 5 caps espacés de 72°, jusqu'à 4 tentatives par cap avec correction d'échelle
 * itérative sur la distance/le D+, dédoublonnage géométrique, 3 meilleurs tracés retenus.
 */
export async function generateLoopRoutes(
  startCoords: LatLng,
  targetKm: number,
  targetDP: number,
  terrain: Terrain,
  onProgress?: GenerateProgress
): Promise<{ routes: GeneratedRoute[]; usedFallback: boolean }> {
  const profile = getBRouterProfile(terrain);
  const isTrail = terrain === 'trail';
  const angles = [0, 72, 144, 216, 288];
  const valid: { coords: GeneratedRoute['coords']; elevation: GeneratedRoute['elevation']; distKm: number; purity: GeneratedRoute['purity'] }[] = [];
  const backup: (typeof valid[number] & { score: number })[] = [];

  onProgress?.(2, 'Recherche des meilleurs segments…');

  for (let i = 0; i < angles.length; i++) {
    const heading = angles[i] + (Math.random() - 0.5) * 20;
    let scale = 0.95;
    let attempt = 0;
    onProgress?.(3, `Boucle ${i + 1}/${angles.length}…`);

    while (attempt < 4) {
      try {
        const feat = await fetchBRouterMultiPoint(loopWpts(startCoords, targetKm, heading, scale), profile);
        const coords = featureToCoords(feat);
        const distKm = calcDist(coords);
        const elevation = analyzeElevation(coords);
        const purity = isTrail ? analyzeTrailPurity(feat) : null;
        const eErr = Math.abs(elevation.totalAscent - targetDP);
        const dErr = Math.abs(distKm - targetKm) / targetKm;
        const trailOk = !isTrail || (purity && purity.pct <= 30);
        const cand = { coords, elevation, distKm, purity };
        const isDup = valid.some((v) => routesSimilar(v, cand));

        if (eErr <= 60 && dErr < 0.18 && trailOk && !isDup) {
          valid.push(cand);
          break;
        } else {
          backup.push({ ...cand, score: eErr + dErr * 100 + (isTrail && purity ? Math.max(0, purity.pct - 30) * 2 : 0) });
        }
        scale *= targetKm / distKm;
        if (elevation.totalAscent < targetDP && isTrail) scale *= 1.1;
        if (isTrail && purity && purity.pct > 30) scale *= 1.12;
        attempt++;
        await delay(120);
      } catch {
        scale *= 0.8;
        attempt++;
      }
    }
    if (valid.length >= 3) break;
  }

  onProgress?.(4, "Calcul de l'altimétrie…");
  await delay(200);
  onProgress?.(5, 'Construction des itinéraires…');

  let sel = valid.length ? valid.slice(0, 3) : backup.sort((a, b) => a.score - b.score).slice(0, 3);
  let usedFallback = false;
  if (!valid.length) {
    const dedup: typeof sel = [];
    for (const r of sel) {
      if (!dedup.some((d) => routesSimilar(d, r))) dedup.push(r);
    }
    sel = dedup.slice(0, 3);
    usedFallback = true;
  }

  const routes: GeneratedRoute[] = sel.map((r, i) => ({
    ...r,
    name: ROUTE_NAMES[i % ROUTE_NAMES.length],
    color: ROUTE_COLORS[i % ROUTE_COLORS.length],
  }));

  return { routes, usedFallback };
}

/** Point de départ aléatoire à 0.5-3km du centre, comme index.html:4892 (quand aucun texte de départ saisi). */
export function randomStartNear(center: LatLng): LatLng {
  return destPoint(center, 0.5 + Math.random() * 2.5, Math.random() * 360);
}
