import { useState } from 'react';
import { shareRouteAsGPX } from '../lib/storage/gpx';
import { GeneratedRoute } from '../types';

/**
 * Exporte le parcours en GPX (partage natif) puis fait apparaître le guide d'import Garmin
 * Connect — le fichier partagé n'est pas forcément récupéré via Garmin Connect (l'utilisateur
 * peut choisir une autre destination dans la feuille de partage), le guide reste donc affiché
 * pour couvrir le cas d'usage principal.
 */
export function useGarminExport() {
  const [filename, setFilename] = useState<string | null>(null);

  async function exportToGarmin(route: Pick<GeneratedRoute, 'coords' | 'name'>): Promise<void> {
    await shareRouteAsGPX(route);
    setFilename(`${route.name.replace(/\s+/g, '_')}.gpx`);
  }

  return {
    garminModalVisible: filename !== null,
    garminFilename: filename ?? '',
    closeGarminModal: () => setFilename(null),
    exportToGarmin,
  };
}
