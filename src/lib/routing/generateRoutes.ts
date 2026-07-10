import { GeneratedRoute, LatLng, Terrain } from '../../types';
import { ROUTE_COLORS, ROUTE_NAMES } from '../../theme/tokens';
import { analyzeElevation, calcDist, destPoint, loopWpts, routesSimilar } from './geo';
import { analyzeTrailPurity, featureToCoords, fetchBRouterMultiPoint, getBRouterProfile } from './brouter';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type GenerateProgress = (step: number, message: string) => void;

/** Port de la branche "itinéraire direct" de generateRoutes (index.html:4900-4919). */
export async function generateDirectRoute(start: LatLng, end: LatLng, terrain: Terrain): Promise<GeneratedRoute> {
  const profile = getBRouterProfile(terrain);
  const feat = await fetchBRouterMultiPoint([start, end], profile);
  const coords = featureToCoords(feat);
  return {
    coords,
    elevation: analyzeElevation(coords),
    distKm: calcDist(coords),
    name: 'Itinéraire Direct',
    purity: terrain === 'trail' ? analyzeTrailPurity(feat) : null,
  };
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
