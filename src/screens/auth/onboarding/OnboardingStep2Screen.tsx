import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ChoiceGrid } from '../../../components/ui/ChoiceGrid';
import { Button } from '../../../components/ui/Button';
import { OnboardingStepLayout } from './OnboardingStepLayout';
import { useOnboarding } from '../../../state/OnboardingContext';
import { useTheme } from '../../../theme/ThemeContext';
import type { OnboardingStackParamList } from '../../../navigation/types';
import { Terrain } from '../../../types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingStep2'>;

const TERRAIN_OPTIONS = [
  { value: 'road' as Terrain, icon: '🛣️', label: 'Route' },
  { value: 'mixed' as Terrain, icon: '🌿', label: 'Mixte' },
  { value: 'trail' as Terrain, icon: '🏔️', label: 'Trail' },
  { value: 'any' as Terrain, icon: '🎲', label: 'Peu importe' },
];

/** Port de ob-step-2 (index.html:2090-2102). */
export function OnboardingStep2Screen({ navigation }: Props) {
  const { tokens } = useTheme();
  const { choices, setChoice } = useOnboarding();
  const [error, setError] = useState('');

  function handleNext() {
    if (!choices.terrain) {
      setError('Fais un choix');
      return;
    }
    navigation.navigate('OnboardingStep3');
  }

  function handleSkip() {
    if (!choices.terrain) setChoice('terrain', 'mixed');
    navigation.navigate('OnboardingStep3');
  }

  return (
    <OnboardingStepLayout step={2} title="Type de sortie préféré" subtitle="Pour pré-régler le terrain">
      <ChoiceGrid options={TERRAIN_OPTIONS} value={choices.terrain} onSelect={(v) => { setChoice('terrain', v); setError(''); }} columns={2} />
      {!!error && <Text style={[styles.error, { color: tokens.danger }]}>{error}</Text>}
      <View style={styles.actions}>
        <Button title="Suivant →" onPress={handleNext} />
        <Button title="← Retour" variant="secondary" onPress={() => navigation.goBack()} />
        <Button title="Passer" variant="text" onPress={handleSkip} />
      </View>
    </OnboardingStepLayout>
  );
}

const styles = StyleSheet.create({
  error: { fontSize: 13, marginTop: 8 },
  actions: { marginTop: 20, gap: 8 },
});
