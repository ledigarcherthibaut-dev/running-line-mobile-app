/** Projection Web Mercator (norme des tuiles XYZ/Esri) — coordonnées de tuile fractionnaires. */
export function lonToTileXFrac(lon: number, zoom: number): number {
  return ((lon + 180) / 360) * 2 ** zoom;
}

export function latToTileYFrac(lat: number, zoom: number): number {
  const latRad = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * 2 ** zoom;
}

export interface TileGrid {
  zoom: number;
  minTileX: number;
  minTileY: number;
  cols: number;
  rows: number;
}

/**
 * Choisit le zoom et la grille de tuiles la plus petite (bornée par `maxTilesPerSide`) qui
 * englobe la zone donnée — pour un aperçu miniature, pas besoin de précision, juste éviter de
 * charger trop de tuiles par carte affichée dans une liste.
 */
export function pickTileGrid(
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  maxTilesPerSide = 2
): TileGrid {
  const lonSpan = Math.max(bounds.maxLng - bounds.minLng, 0.0005);
  const latSpan = Math.max(bounds.maxLat - bounds.minLat, 0.0005);
  let zoom = Math.floor(Math.min(Math.log2(360 / lonSpan), Math.log2(360 / latSpan))) - 1;
  zoom = Math.min(Math.max(zoom, 8), 17);

  for (let attempt = 0; attempt < 6; attempt++) {
    const minX = Math.floor(lonToTileXFrac(bounds.minLng, zoom));
    const maxX = Math.floor(lonToTileXFrac(bounds.maxLng, zoom));
    const minY = Math.floor(latToTileYFrac(bounds.maxLat, zoom));
    const maxY = Math.floor(latToTileYFrac(bounds.minLat, zoom));
    const cols = maxX - minX + 1;
    const rows = maxY - minY + 1;
    if ((cols <= maxTilesPerSide && rows <= maxTilesPerSide) || zoom <= 8) {
      return { zoom, minTileX: minX, minTileY: minY, cols: Math.min(cols, maxTilesPerSide), rows: Math.min(rows, maxTilesPerSide) };
    }
    zoom -= 1;
  }
  return { zoom, minTileX: Math.floor(lonToTileXFrac(bounds.minLng, zoom)), minTileY: Math.floor(latToTileYFrac(bounds.maxLat, zoom)), cols: 1, rows: 1 };
}
