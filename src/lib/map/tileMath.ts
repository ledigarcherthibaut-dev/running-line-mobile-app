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
 *
 * `cols`/`rows` renvoyés correspondent TOUJOURS exactement au nombre de tuiles nécessaires pour
 * couvrir `bounds` au zoom choisi (jamais tronqués séparément) : l'appelant les utilise à la fois
 * pour savoir combien de tuiles charger et pour repositionner le tracé en pourcentage — un
 * décalage entre les deux désynchronise le tracé de la photo (tracé coupé ou mal aligné).
 */
export function pickTileGrid(
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  maxTilesPerSide = 2
): TileGrid {
  const lonSpan = Math.max(bounds.maxLng - bounds.minLng, 0.0005);
  const latSpan = Math.max(bounds.maxLat - bounds.minLat, 0.0005);
  let zoom = Math.floor(Math.min(Math.log2(360 / lonSpan), Math.log2(360 / latSpan))) - 1;
  zoom = Math.min(Math.max(zoom, 2), 17);

  let best: TileGrid | null = null;
  for (; zoom >= 2; zoom--) {
    const minX = Math.floor(lonToTileXFrac(bounds.minLng, zoom));
    const maxX = Math.floor(lonToTileXFrac(bounds.maxLng, zoom));
    const minY = Math.floor(latToTileYFrac(bounds.maxLat, zoom));
    const maxY = Math.floor(latToTileYFrac(bounds.minLat, zoom));
    const cols = maxX - minX + 1;
    const rows = maxY - minY + 1;
    best = { zoom, minTileX: minX, minTileY: minY, cols, rows };
    if (cols <= maxTilesPerSide && rows <= maxTilesPerSide) return best;
  }
  // Zoom minimal atteint sans passer sous maxTilesPerSide (zone très étendue) : on rend quand
  // même la grille réelle plutôt que de la tronquer, pour garder tracé et photo synchronisés.
  return best!;
}
