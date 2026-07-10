import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import type { MyRoutesStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MyRoutesStackParamList, 'MyRoutesScreen'>;

export function MyRoutesScreen({ navigation }: Props) {
  const { tokens } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: tokens.bg }]}>
      <Text style={[styles.title, { color: tokens.text }]}>Mes parcours</Text>
      <Text style={{ color: tokens.text2 }}>Liste des parcours sauvegardés (Étape 2)</Text>
      <Pressable onPress={() => navigation.navigate('RouteDetail', { routeId: 'demo' })}>
        <Text style={{ color: tokens.accent }}>Voir un parcours (démo nav)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  title: { fontSize: 20, fontWeight: '700' },
});
