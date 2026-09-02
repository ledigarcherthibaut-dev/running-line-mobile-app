import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { SavedRoute, UserProfile } from '../types';

/** Export RGPD (droit à la portabilité) : profil + parcours sauvegardés, en JSON partageable. */
export async function exportUserData(profile: UserProfile, savedRoutes: SavedRoute[]): Promise<void> {
  const available = await Sharing.isAvailableAsync();
  if (!available) throw new Error("Le partage de fichiers n'est pas disponible sur cet appareil.");

  const payload = {
    exportedAt: new Date().toISOString(),
    profile,
    savedRoutes,
  };

  const filename = `running_line_donnees_${profile.id}.json`;
  const file = new File(Paths.cache, filename);
  if (file.exists) file.delete();
  file.create();
  file.write(JSON.stringify(payload, null, 2));

  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Exporter mes données',
  });
}
