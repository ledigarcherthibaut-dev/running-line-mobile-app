import { useEffect } from 'react';
import { useAuth } from '../state/AuthContext';
import { useTheme } from './ThemeContext';

/**
 * Applique le thème enregistré dans le profil Supabase (`profiles.theme`) uniquement sur un
 * appareil qui n'a encore aucune préférence locale — nouvelle installation, nouveau téléphone.
 * ThemeContext reste sinon 100% local (AsyncStorage) : ce composant ne fait que rattraper le cas
 * "je me connecte ailleurs et je veux retrouver mon thème", sans jamais écraser un choix déjà
 * fait sur cet appareil.
 */
export function ThemeProfileSync() {
  const { profile } = useAuth();
  const { localPreferenceLoaded, hasLocalPreference, setMode } = useTheme();

  useEffect(() => {
    if (localPreferenceLoaded && !hasLocalPreference && profile?.theme) {
      setMode(profile.theme);
    }
  }, [localPreferenceLoaded, hasLocalPreference, profile, setMode]);

  return null;
}
