import { LatLng } from '../../types';

const GEOCODE_TIMEOUT_MS = 10000;
const NOMINATIM_HEADERS = { 'Accept-Language': 'fr', 'User-Agent': 'RunningLineMobile/1.0' };

export interface PlaceSuggestion {
  label: string;
  coords: LatLng;
}

/** Port de geocode() (index.html:4046-4051), avec timeout explicite. */
export async function geocode(query: string): Promise<LatLng> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEOCODE_TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: NOMINATIM_HEADERS, signal: controller.signal }
    );
    const data = await res.json();
    if (!data || !data.length) throw new Error(`Lieu introuvable : "${query}"`);
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw new Error('Délai dépassé pendant la recherche du lieu.');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

/** Suggestions d'autocomplétion au fil de la frappe (écran Générer) — mêmes contraintes que geocode(). */
export async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEOCODE_TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
      { headers: NOMINATIM_HEADERS, signal: controller.signal }
    );
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((d: any): PlaceSuggestion => ({
      label: d.display_name,
      coords: { lat: parseFloat(d.lat), lng: parseFloat(d.lon) },
    }));
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}
