import * as Location from 'expo-location';
import { LatLng } from '../../types';

export class LocationError extends Error {}

/**
 * Port de getUserLocation (index.html:4000-4023) avec expo-location.
 * Gestion explicite : refus de permission -> message clair, timeout -> message clair,
 * position indisponible -> fallback IP (ipapi.co), comme sur le web.
 */
export async function getUserLocation(): Promise<LatLng> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new LocationError('Accès à la position refusé. Active la géolocalisation ou saisis un lieu.');
  }

  try {
    const position = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new LocationError('TIMEOUT')), 15000)),
    ]);
    return { lat: position.coords.latitude, lng: position.coords.longitude };
  } catch (e) {
    if (e instanceof LocationError && e.message === 'TIMEOUT') {
      throw new LocationError('Délai GPS dépassé. Réessaie ou saisis un lieu manuellement.');
    }
    // POSITION_UNAVAILABLE ou autre -> fallback IP, comme sur le web.
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      if (data.latitude && data.longitude) return { lat: data.latitude, lng: data.longitude };
      throw new Error('no ip location');
    } catch {
      throw new LocationError('Position non disponible. Saisis un lieu ou une ville.');
    }
  }
}
