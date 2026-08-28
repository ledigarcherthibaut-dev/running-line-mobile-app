import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from './ui/Icon';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/tokens';

/** Bandeau global affiché hors-ligne — les écrans continuent d'afficher les dernières données en cache. */
export function OfflineBanner() {
  const { isOffline } = useNetworkStatus();
  const { tokens } = useTheme();
  if (!isOffline) return null;

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: tokens.text }]} pointerEvents="none">
      <View style={styles.row}>
        <Icon name="wifi-off" size={12} color={tokens.bg} />
        <Text style={[styles.text, { color: tokens.bg }]}>Hors ligne — dernières données affichées</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000, alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  text: { fontSize: 11, fontFamily: fonts.mono },
});
