import { Coord } from '../../types';

export interface BBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

/**
 * Calcule une bbox (marge incluse) autour du tracé, étirée pour matcher exactement le ratio
 * largeur/hauteur du conteneur d'affichage — c'est ce qui évite toute déformation : on demande
 * ensuite une image satellite déjà cadrée à ce ratio, pas une image carrée qu'on écraserait.
 * La correction en cos(latitude) compense le fait qu'à une latitude donnée, 1° de longitude
 * représente moins de distance réelle que 1° de latitude.
 */
export function computeAspectBBox(coords: Coord[], aspect: number, paddingRatio = 0.18): BBox {
  const lats = coords.map((c) => c[1]);
  const lngs = coords.map((c) => c[0]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const midLat = (minLat + maxLat) / 2;
  const midLng = (minLng + maxLng) / 2;
  const latCos = Math.max(Math.cos((midLat * Math.PI) / 180), 0.15);

  const latSpan = Math.max(maxLat - minLat, 0.0006);
  const lngSpanKm = Math.max((maxLng - minLng) * latCos, 0.0006);

  let halfLat = (latSpan * (1 + paddingRatio * 2)) / 2;
  let halfLngKm = (lngSpanKm * (1 + paddingRatio * 2)) / 2;

  const boxAspect = halfLngKm / halfLat;
  if (boxAspect < aspect) {
    halfLngKm = halfLat * aspect;
  } else {
    halfLat = halfLngKm / aspect;
  }
  const halfLng = halfLngKm / latCos;

  return { minLat: midLat - halfLat, maxLat: midLat + halfLat, minLng: midLng - halfLng, maxLng: midLng + halfLng };
}
