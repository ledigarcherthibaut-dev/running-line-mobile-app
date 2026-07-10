import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import type { ExplorerStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ExplorerStackParamList, 'ExplorerScreen'>;

export function ExplorerScreen({ navigation }: Props) {
  const { tokens } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: tokens.bg }]}>
      <Text style={[styles.title, { color: tokens.text }]}>Explorer</Text>
      <Text style={{ color: tokens.text2 }}>Sentiers OSM + parcours communautaires (Étape 2)</Text>
      <Pressable onPress={() => navigation.navigate('TrailDetail', { trailId: 'demo' })}>
        <Text style={{ color: tokens.accent }}>Voir un sentier (démo nav)</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('RouteDetail', { routeId: 'demo' })}>
        <Text style={{ color: tokens.accent }}>Voir un parcours communautaire (démo nav)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  title: { fontSize: 20, fontWeight: '700' },
});
