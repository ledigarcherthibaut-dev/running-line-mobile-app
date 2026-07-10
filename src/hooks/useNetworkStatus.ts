import { useNetInfo } from '@react-native-community/netinfo';

/** true si l'appareil est explicitement hors-ligne (état inconnu au démarrage != hors-ligne). */
export function useNetworkStatus(): { isOffline: boolean } {
  const { isConnected } = useNetInfo();
  return { isOffline: isConnected === false };
}
