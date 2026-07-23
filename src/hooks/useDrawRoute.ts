import { useCallback, useState } from 'react';
import { Coord, GeneratedRoute, LatLng, Terrain } from '../types';
import { fetchBRouterMultiPoint, formatBRouterError, getBRouterProfile, featureToCoords } from '../lib/routing/brouter';
import { analyzeElevation, calcDist } from '../lib/routing/geo';

interface Segment {
  coords: Coord[];
}

/**
 * Port de drawState + onMapClick/drawUndo/drawClear/drawFinish (index.html:2975-2978, 4621-4721) :
 * chaque tap ajoute un point, BRouter route le segment vers le point précédent.
 */
export function useDrawRoute(terrain: Terrain) {
  const [points, setPoints] = useState<LatLng[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [routing, setRouting] = useState(false);
  const [error, setError] = useState('');

  const allCoords: Coord[] = segments.flatMap((s) => s.coords);
  const distKm = allCoords.length > 1 ? calcDist(allCoords) : 0;
  const isClosed =
    points.length >= 3 &&
    points[points.length - 1].lat === points[0].lat &&
    points[points.length - 1].lng === points[0].lng;

  const addPoint = useCallback(
    async (pt: LatLng) => {
      const prev = points[points.length - 1];
      setPoints((p) => [...p, pt]);
      if (!prev) return;

      setRouting(true);
      setError('');
      try {
        const profile = getBRouterProfile(terrain);
        const feat = await fetchBRouterMultiPoint([prev, pt], profile);
        setSegments((s) => [...s, { coords: featureToCoords(feat) }]);
      } catch (e) {
        setError(formatBRouterError(e));
      } finally {
        setRouting(false);
      }
    },
    [points, terrain]
  );

  const undo = useCallback(() => {
    setPoints((p) => p.slice(0, -1));
    setSegments((s) => s.slice(0, -1));
  }, []);

  const closeLoop = useCallback(async () => {
    if (points.length < 2 || isClosed) return;
    await addPoint(points[0]);
  }, [points, isClosed, addPoint]);

  const clear = useCallback(() => {
    setPoints([]);
    setSegments([]);
    setError('');
  }, []);

  function finish(name: string): GeneratedRoute | null {
    if (allCoords.length < 2) return null;
    return {
      coords: allCoords,
      distKm: calcDist(allCoords),
      elevation: analyzeElevation(allCoords),
      name: name || 'Mon parcours',
      color: '#BEA3FE',
    };
  }

  return { points, allCoords, distKm, routing, error, isClosed, addPoint, undo, clear, closeLoop, finish };
}
