import { Coord, LatLng } from '../../types';
import { calcDist } from '../routing/geo';

const OVERPASS_TIMEOUT_MS = 25000;
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

export type TrailType = 'foot' | 'bicycle' | 'mtb';

export interface OSMTrail {
  id: number;
  name: string;
  type: TrailType;
  distance?: string;
  network?: string;
}

async function overpassFetch(query: string): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OVERPASS_TIMEOUT_MS);
  try {
    const res = await fetch(OVERPASS_URL, { method: 'POST', body: query, signal: controller.signal });
    if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw new Error('Délai dépassé pendant la recherche de sentiers.');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

/** Port de loadExistingTrails (index.html:4452-4498) — sentiers OSM dans un rayon de 25km. */
export async function fetchNearbyTrails(center: LatLng): Promise<OSMTrail[]> {
  const q = `[out:json][timeout:25];
(
  relation["route"="hiking"](around:25000,${center.lat},${center.lng});
  relation["route"="foot"](around:25000,${center.lat},${center.lng});
  relation["route"="bicycle"]["network"~"^(rcn|ncn|icn|lcn)$"](around:25000,${center.lat},${center.lng});
  relation["route"="mtb"](around:25000,${center.lat},${center.lng});
);
out tags 30;`;
  const data = await overpassFetch(q);
  const elements = (data.elements || []).filter((e: any) => e.tags?.name).slice(0, 25);
  return elements.map((t: any): OSMTrail => {
    const route = t.tags.route;
    const type: TrailType = route === 'mtb' ? 'mtb' : route === 'bicycle' ? 'bicycle' : 'foot';
    return { id: t.id, name: t.tags.name, type, distance: t.tags.distance || t.tags.length, network: t.tags.network };
  });
}

/** Port de loadOSMTrail (index.html:4530-4563) — géométrie complète d'un sentier par id de relation. */
export async function fetchTrailGeometry(id: number): Promise<{ coords: Coord[]; distKm: number }> {
  const q = `[out:json][timeout:30];relation(${id});(._;>;);out geom;`;
  const data = await overpassFetch(q);
  const ways = (data.elements || []).filter((e: any) => e.type === 'way' && e.geometry);
  if (!ways.length) throw new Error('Pas de géométrie disponible pour ce sentier.');
  const coords: Coord[] = ([] as Coord[]).concat(
    ...ways.map((w: any) => w.geometry.map((g: any): Coord => [g.lon, g.lat, 0]))
  );
  return { coords, distKm: calcDist(coords) };
}
