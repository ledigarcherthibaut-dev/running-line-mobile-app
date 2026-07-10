import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import type { GenerateStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<GenerateStackParamList, 'GenerateScreen'>;

export function GenerateScreen({ navigation }: Props) {
  const { tokens } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: tokens.bg }]}>
      <Text style={[styles.title, { color: tokens.text }]}>Générer un parcours</Text>
      <Text style={{ color: tokens.text2 }}>Distance / allure / D+ / terrain (Étape 2)</Text>
      <Pressable onPress={() => navigation.navigate('GenerateResults')}>
        <Text style={{ color: tokens.accent }}>Voir les résultats (démo nav)</Text>
      </Pressable>
      <Pressable onPress={() => navigation.navigate('DrawRoute')}>
        <Text style={{ color: tokens.accent }}>Dessiner manuellement</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  title: { fontSize: 20, fontWeight: '700' },
});
