import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import type { TrailDetailParams } from '../../navigation/types';

type TrailDetailRouteProp = RouteProp<{ TrailDetail: TrailDetailParams }, 'TrailDetail'>;

export function TrailDetailScreen() {
  const { tokens } = useTheme();
  const { params } = useRoute<TrailDetailRouteProp>();
  return (
    <View style={[styles.container, { backgroundColor: tokens.bg }]}>
      <Text style={[styles.title, { color: tokens.text }]}>Détail du sentier</Text>
      <Text style={{ color: tokens.text2 }}>trailId: {params.trailId} (géométrie OSM en Étape 2)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  title: { fontSize: 20, fontWeight: '700' },
});
