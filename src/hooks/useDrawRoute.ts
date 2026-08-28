import { useCallback, useState } from 'react';
import { Coord, GeneratedRoute, LatLng, Terrain } from '../types';
import { fetchBRouterMultiPoint, formatBRouterError, getBRouterProfile, featureToCoords } from '../lib/routing/brouter';
import { analyzeElevation, calcDist, simplifyToWaypoints } from '../lib/routing/geo';
import { lightTokens } from '../theme/tokens';

interface Segment {
  coords: Coord[];
}

/**
 * Port de drawState + onMapClick/drawUndo/drawClear/drawFinish (index.html:2975-2978, 4621-4721) :
 * chaque tap ajoute un point, BRouter route le segment vers le point précédent. Étendu pour cette
 * app avec l'import GPX (simplification en points de contrôle éditables) et le déplacement d'un
 * point existant (sélection puis tap de destination — l'annotation MapLibre RN n'a pas de drag
 * natif), avec recalcul BRouter limité aux seuls segments touchés par le point déplacé.
 */
export function useDrawRoute(terrain: Terrain) {
  const [points, setPoints] = useState<LatLng[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [routing, setRouting] = useState(false);
  const [error, setError] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

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
    setSelectedIndex(null);
  }, []);

  const closeLoop = useCallback(async () => {
    if (points.length < 2 || isClosed) return;
    await addPoint(points[0]);
  }, [points, isClosed, addPoint]);

  const clear = useCallback(() => {
    setPoints([]);
    setSegments([]);
    setError('');
    setSelectedIndex(null);
  }, []);

  /** Sélectionne/désélectionne un point pour le déplacer (retoucher le même point annule). */
  const selectPoint = useCallback((index: number) => {
    setSelectedIndex((cur) => (cur === index ? null : index));
  }, []);

  const deselectPoint = useCallback(() => setSelectedIndex(null), []);

  /**
   * Déplace le point sélectionné vers `coord` et ne recalcule via BRouter que les segments
   * adjacents à ce point (pas tout le tracé). Si le tracé est bouclé et que le point déplacé est
   * l'une des deux extrémités (identiques par construction), l'autre extrémité suit pour que la
   * boucle reste fermée.
   */
  const moveSelected = useCallback(
    async (coord: LatLng) => {
      if (selectedIndex === null) return;
      const index = selectedIndex;
      setSelectedIndex(null);

      const affected = new Set<number>([index]);
      if (isClosed) {
        if (index === 0) affected.add(points.length - 1);
        if (index === points.length - 1) affected.add(0);
      }

      const newPoints = [...points];
      affected.forEach((i) => {
        newPoints[i] = coord;
      });
      setPoints(newPoints);
      setError('');

      const segmentIdx = new Set<number>();
      affected.forEach((i) => {
        if (i > 0) segmentIdx.add(i - 1);
        if (i < newPoints.length - 1) segmentIdx.add(i);
      });
      if (!segmentIdx.size) return;

      setRouting(true);
      try {
        const profile = getBRouterProfile(terrain);
        const updated = [...segments];
        for (const i of segmentIdx) {
          const feat = await fetchBRouterMultiPoint([newPoints[i], newPoints[i + 1]], profile);
          updated[i] = { coords: featureToCoords(feat) };
        }
        setSegments(updated);
      } catch (e) {
        setError(formatBRouterError(e));
      } finally {
        setRouting(false);
      }
    },
    [points, segments, terrain, isClosed, selectedIndex]
  );

  /**
   * Importe une trace GPX dense : la simplifie en points de contrôle éditables
   * (simplifyToWaypoints) puis route chaque segment via BRouter, exactement comme un tracé fait
   * point par point — le tracé importé devient ensuite modifiable de la même façon.
   */
  const importGpx = useCallback(
    async (dense: Coord[]) => {
      const denseLatLng: LatLng[] = dense.map((c) => ({ lat: c[1], lng: c[0] }));
      const waypoints = simplifyToWaypoints(denseLatLng, 20);
      if (waypoints.length < 2) {
        setError('Tracé GPX trop court.');
        return;
      }
      setError('');
      setSelectedIndex(null);
      setPoints(waypoints);
      setSegments([]);
      setRouting(true);
      try {
        const profile = getBRouterProfile(terrain);
        const newSegments: Segment[] = [];
        for (let i = 1; i < waypoints.length; i++) {
          const feat = await fetchBRouterMultiPoint([waypoints[i - 1], waypoints[i]], profile);
          newSegments.push({ coords: featureToCoords(feat) });
        }
        setSegments(newSegments);
      } catch (e) {
        setError(formatBRouterError(e));
      } finally {
        setRouting(false);
      }
    },
    [terrain]
  );

  function finish(name: string): GeneratedRoute | null {
    if (allCoords.length < 2) return null;
    return {
      coords: allCoords,
      distKm: calcDist(allCoords),
      elevation: analyzeElevation(allCoords),
      name: name || 'Mon parcours',
      // Couleurs de marque identiques clair/sombre (theme/tokens.ts) — ce hook n'est pas un
      // composant, pas de useTheme() possible ici.
      color: lightTokens.secondary,
    };
  }

  return {
    points,
    allCoords,
    distKm,
    routing,
    error,
    isClosed,
    selectedIndex,
    addPoint,
    undo,
    clear,
    closeLoop,
    selectPoint,
    deselectPoint,
    moveSelected,
    importGpx,
    finish,
  };
}
