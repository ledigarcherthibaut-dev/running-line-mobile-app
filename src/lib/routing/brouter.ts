import { Coord, LatLng, Terrain, TrailPurity } from '../../types';

const BROUTER_TIMEOUT_MS = 20000;

/** Sous-ensemble minimal d'un Feature GeoJSON — évite une dépendance à @types/geojson. */
export interface BRouterFeature {
  type: 'Feature';
  geometry: { type: 'LineString'; coordinates: Coord[] };
  properties?: { messages?: string[][]; [key: string]: unknown };
}

/** index.html:4146-4148 */
export function getBRouterProfile(t: Terrain): string {
  return { road: 'fastbike', mixed: 'trekking', trail: 'hiking-mountain', any: 'trekking' }[t] || 'trekking';
}

export class BRouterError extends Error {
  constructor(public code: string) {
    super(code);
    this.name = 'BRouterError';
  }
}

/**
 * Port de fetchBRouterMultiPoint (index.html:4150-4157), avec ajout d'un timeout explicite
 * (absent côté web) pour la robustesse réseau mobile.
 */
export async function fetchBRouterMultiPoint(points: LatLng[], profile: string): Promise<BRouterFeature> {
  const ll = points.map((p) => `${p.lng.toFixed(6)},${p.lat.toFixed(6)}`).join('|');
  const url = `https://brouter.de/brouter?lonlats=${ll}&profile=${profile}&alternativeidx=0&format=geojson`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BROUTER_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(url, { signal: controller.signal });
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw new BRouterError('TIMEOUT');
    throw new BRouterError('NETWORK');
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) throw new BRouterError(`HTTP_${res.status}`);
  const data = await res.json();
  if (!data.features || !data.features.length) throw new BRouterError('NO_ROUTE');
  return data.features[0];
}

/** Port de formatBRouterError (index.html:4159-4172), adapté aux codes de BRouterError. */
export function formatBRouterError(err: unknown): string {
  if (err instanceof BRouterError) {
    switch (err.code) {
      case 'TIMEOUT':
        return "Délai dépassé — le serveur de calcul n'a pas répondu à temps. Réessaie.";
      case 'NETWORK':
        return 'Connexion impossible — vérifie ta connexion internet.';
      case 'NO_ROUTE':
        return 'Aucun tracé trouvé dans cette zone.';
      case 'HTTP_429':
        return 'Trop de requêtes — réessaie dans quelques secondes.';
      case 'HTTP_500':
      case 'HTTP_503':
        return 'Le serveur de calcul est temporairement indisponible.';
      case 'HTTP_400':
        return "La zone choisie n'est pas couverte par BRouter.";
      default:
        return `Erreur de calcul (${err.code.replace('HTTP_', '')}) — réessaie ou change le point de départ.`;
    }
  }
  return err instanceof Error ? err.message : 'Erreur inconnue lors du calcul.';
}

/** index.html:4174-4188 — % du tracé sur revêtement bitumé, à partir des messages de debug BRouter. */
export function analyzeTrailPurity(feat: BRouterFeature): TrailPurity {
  try {
    const msgs = (feat.properties as any)?.messages as string[][] | undefined;
    if (!msgs || msgs.length < 2) return { pct: 0, label: 'N/A', cssClass: 'good' };
    const header = msgs[0];
    const di = header.indexOf('Distance');
    const si = header.indexOf('WayTags');
    if (di < 0) return { pct: 0, label: 'N/A', cssClass: 'good' };
    let tot = 0;
    let asphalt = 0;
    for (let i = 1; i < msgs.length; i++) {
      const d = parseFloat(msgs[i][di]) || 0;
      tot += d;
      if (/surface=(asphalt|paved|concrete|paving_stones|sett|cobblestone)/.test((msgs[i][si] || '').toLowerCase())) {
        asphalt += d;
      }
    }
    const pct = tot > 0 ? Math.round((asphalt / tot) * 100) : 0;
    return { pct, label: `${pct}% bitume`, cssClass: pct <= 30 ? 'good' : pct <= 50 ? 'warn' : 'bad' };
  } catch {
    return { pct: 0, label: 'N/A', cssClass: 'good' };
  }
}

export function featureToCoords(feat: BRouterFeature): Coord[] {
  return feat.geometry.coordinates;
}
