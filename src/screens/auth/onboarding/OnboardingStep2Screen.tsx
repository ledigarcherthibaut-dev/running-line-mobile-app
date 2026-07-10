import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import type { AuthStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'OnboardingStep2'>;

export function OnboardingStep2Screen({ navigation }: Props) {
  const { tokens } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: tokens.bg }]}>
      <Text style={[styles.title, { color: tokens.text }]}>Onboarding — étape 2/3</Text>
      <Text style={{ color: tokens.text2 }}>Distance préférée (à venir en Étape 2)</Text>
      <Pressable
        style={[styles.button, { backgroundColor: tokens.accent }]}
        onPress={() => navigation.navigate('OnboardingStep3')}
      >
        <Text style={styles.buttonText}>Suivant</Text>
      </Pressable>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={{ color: tokens.text2 }}>Retour</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 16 },
  title: { fontSize: 20, fontWeight: '700' },
  button: { borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
