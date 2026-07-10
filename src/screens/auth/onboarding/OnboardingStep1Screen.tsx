import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ChoiceGrid } from '../../../components/ui/ChoiceGrid';
import { Button } from '../../../components/ui/Button';
import { OnboardingStepLayout } from './OnboardingStepLayout';
import { useOnboarding } from '../../../state/OnboardingContext';
import { useTheme } from '../../../theme/ThemeContext';
import type { OnboardingStackParamList } from '../../../navigation/types';
import { Level } from '../../../types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingStep1'>;

const LEVEL_OPTIONS = [
  { value: 'beginner' as Level, icon: '🌱', label: 'Débutant', sub: '<1 an' },
  { value: 'intermediate' as Level, icon: '🏃', label: 'Inter.', sub: '1-3 ans' },
  { value: 'advanced' as Level, icon: '⚡', label: 'Avancé', sub: '>3 ans' },
];

/** Port de ob-step-1 (index.html:2075-2089). */
export function OnboardingStep1Screen({ navigation }: Props) {
  const { tokens } = useTheme();
  const { choices, setChoice } = useOnboarding();
  const [error, setError] = useState('');

  function handleNext() {
    if (!choices.level) {
      setError('Fais un choix');
      return;
    }
    navigation.navigate('OnboardingStep2');
  }

  function handleSkip() {
    if (!choices.level) setChoice('level', 'intermediate');
    navigation.navigate('OnboardingStep2');
  }

  return (
    <OnboardingStepLayout step={1} title="Quel est ton niveau ?" subtitle="On adapte les parcours à ton profil — 30 secondes chrono ⚡">
      <ChoiceGrid options={LEVEL_OPTIONS} value={choices.level} onSelect={(v) => { setChoice('level', v); setError(''); }} columns={3} />
      {!!error && <Text style={[styles.error, { color: tokens.danger }]}>{error}</Text>}
      <View style={styles.actions}>
        <Button title="Suivant →" onPress={handleNext} />
        <Button title="Passer" variant="text" onPress={handleSkip} />
      </View>
    </OnboardingStepLayout>
  );
}

const styles = StyleSheet.create({
  error: { fontSize: 13, marginTop: 8 },
  actions: { marginTop: 20, gap: 4 },
});
