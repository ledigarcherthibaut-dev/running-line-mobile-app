import { LatLng } from '../../types';

const GEOCODE_TIMEOUT_MS = 10000;

/** Port de geocode() (index.html:4046-4051), avec timeout explicite. */
export async function geocode(query: string): Promise<LatLng> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEOCODE_TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'fr' }, signal: controller.signal }
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
