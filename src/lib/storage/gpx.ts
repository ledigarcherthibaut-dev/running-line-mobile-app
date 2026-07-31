import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Coord, GeneratedRoute } from '../../types';

/** Port fidèle de generateGPX (index.html:4238-4241). */
export function generateGPX(route: Pick<GeneratedRoute, 'coords' | 'name'>): string {
  const now = new Date().toISOString();
  const pts = route.coords
    .map((c) => `    <trkpt lat="${c[1].toFixed(7)}" lon="${c[0].toFixed(7)}"><ele>${(c[2] || 0).toFixed(1)}</ele></trkpt>`)
    .join('\n');
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<gpx version="1.1" creator="Running Line Mobile" xmlns="http://www.topografix.com/GPX/1/1">\n' +
    `  <metadata><name>${route.name}</name><time>${now}</time></metadata>\n` +
    `  <trk><name>${route.name}</name><trkseg>\n${pts}\n  </trkseg></trk>\n` +
    '</gpx>'
  );
}

/**
 * Équivalent mobile de downloadGPX + sendToGarminMobile (index.html:4243-4270) :
 * écrit le GPX dans le cache puis ouvre la feuille de partage native (Garmin Connect, etc.)
 * via expo-sharing, au lieu du téléchargement navigateur. API File/Paths (expo-file-system SDK 57+).
 */
export async function shareRouteAsGPX(route: Pick<GeneratedRoute, 'coords' | 'name'>): Promise<void> {
  const available = await Sharing.isAvailableAsync();
  if (!available) throw new Error("Le partage de fichiers n'est pas disponible sur cet appareil.");

  const filename = `${route.name.replace(/\s+/g, '_')}.gpx`;
  const file = new File(Paths.cache, filename);
  if (file.exists) file.delete();
  file.create();
  file.write(generateGPX(route));

  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/gpx+xml',
    dialogTitle: `Envoyer "${route.name}"`,
  });
}

/**
 * Extrait les points de trace d'un fichier GPX (import, pour édition dans le mode dessin).
 * Parseur minimal par regex plutôt qu'une dépendance XML : les fichiers GPX exportés par les
 * montres/apps courantes (Garmin, Strava, cette app…) suivent tous le même schéma `<trkpt>`
 * simple, pas besoin d'un parseur DOM complet pour ça.
 */
export function parseGPX(xml: string): Coord[] {
  const coords: Coord[] = [];
  const trkptRe = /<trkpt\b([^>]*?)(?:\/>|>([\s\S]*?)<\/trkpt>)/gi;
  let m: RegExpExecArray | null;
  while ((m = trkptRe.exec(xml))) {
    const attrs = m[1];
    const inner = m[2] || '';
    const latM = attrs.match(/\blat=["']([-\d.]+)["']/i);
    const lonM = attrs.match(/\blon=["']([-\d.]+)["']/i);
    if (!latM || !lonM) continue;
    const lat = parseFloat(latM[1]);
    const lon = parseFloat(lonM[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const eleM = inner.match(/<ele>([-\d.]+)<\/ele>/i);
    coords.push([lon, lat, eleM ? parseFloat(eleM[1]) : 0]);
  }
  if (coords.length < 2) throw new Error('Fichier GPX invalide ou vide (aucun point de tracé trouvé).');
  return coords;
}
