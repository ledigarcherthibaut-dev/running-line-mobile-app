/** Sources de tuiles gratuites, sans clé — mêmes fournisseurs que le web (index.html:3865-3867). */
export type TileStyle = 'osm' | 'topo' | 'satellite';

export const TILE_URLS: Record<TileStyle, string> = {
  osm: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  topo: 'https://tile.opentopomap.org/{z}/{x}/{y}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
};
