import Svg, { Circle, Polyline } from 'react-native-svg';
import { Coord } from '../../types';

/**
 * Silhouette du tracé (port de buildRoutePreviewSVG, index.html:3555-3578) — utilisée sur les
 * cartes de parcours à la place d'un aperçu carte statique. Le flou de halo du web (filtre
 * SVG feGaussianBlur) est omis : support inégal selon plateforme dans react-native-svg,
 * remplacé par un simple double-trait qui donne le même effet lisible.
 */
export function RoutePreviewSvg({ coords, color }: { coords: Coord[]; color: string }) {
  if (!coords || coords.length < 2) return null;

  const sample = coords.filter((_, i) => i % Math.max(1, Math.floor(coords.length / 60)) === 0);
  const lngs = sample.map((c) => c[0]);
  const lats = sample.map((c) => c[1]);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const W = 300;
  const H = 90;
  const pad = 14;
  const rng = (v: number) => (v === 0 ? 1 : v);
  const sx = (lng: number) => pad + ((lng - minLng) / rng(maxLng - minLng)) * (W - 2 * pad);
  const sy = (lat: number) => H - pad - ((lat - minLat) / rng(maxLat - minLat)) * (H - 2 * pad);
  const points = sample.map((c) => `${sx(c[0]).toFixed(1)},${sy(c[1]).toFixed(1)}`).join(' ');

  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
      <Polyline points={points} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" strokeOpacity={0.3} />
      <Polyline points={points} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" strokeOpacity={1} />
      <Circle cx={sx(sample[0][0])} cy={sy(sample[0][1])} r={3.5} fill={color} opacity={0.9} />
      <Circle
        cx={sx(sample[sample.length - 1][0])}
        cy={sy(sample[sample.length - 1][1])}
        r={3.5}
        fill="white"
        stroke={color}
        strokeWidth={1.5}
        opacity={0.9}
      />
    </Svg>
  );
}
