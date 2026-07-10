import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Cache offline générique — AsyncStorage plutôt qu'expo-sqlite : les données à mettre en
 * cache (parcours sauvegardés, réglages) sont de simples listes JSON par utilisateur, sans
 * besoin de requêtes relationnelles. AsyncStorage suffit largement au volume concerné
 * (quelques dizaines de parcours par utilisateur) et évite une dépendance/migration en plus.
 */
const PREFIX = 'rl_cache_';

export async function readCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function writeCache<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Cache best-effort : une écriture qui échoue (stockage plein, etc.) ne doit pas casser l'app.
  }
}

export async function clearCache(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(PREFIX + key);
  } catch {
    // idem
  }
}
