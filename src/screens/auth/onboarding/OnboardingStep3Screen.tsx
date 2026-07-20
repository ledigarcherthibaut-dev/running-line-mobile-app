import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChoiceGrid } from '../../../components/ui/ChoiceGrid';
import { Button } from '../../../components/ui/Button';
import { OnboardingStepLayout } from './OnboardingStepLayout';
import { useOnboarding } from '../../../state/OnboardingContext';
import { useAuth } from '../../../state/AuthContext';
import { useTheme } from '../../../theme/ThemeContext';
import { saveProfile } from '../../../lib/supabase/profile';
import type { OnboardingStackParamList } from '../../../navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'OnboardingStep3'>;

const DIST_OPTIONS = [
  { value: '5', icon: 'feather' as const, label: '5 km' },
  { value: '10', icon: 'award' as const, label: '10 km' },
  { value: '20', icon: 'zap' as const, label: '20 km' },
  { value: '30', icon: 'star' as const, label: '30 km+' },
];

/** Port de ob-step-3 + finishOnboarding (index.html:2103-2115, 3379-3393). */
export function OnboardingStep3Screen() {
  const navigation = useNavigation<Nav>();
  const { tokens, mode } = useTheme();
  const { choices, setChoice } = useOnboarding();
  const { session, refreshProfile } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function finish(level = choices.level, terrain = choices.terrain, dist = choices.dist) {
    if (!session?.user) return;
    setLoading(true);
    const { error: saveError } = await saveProfile(
      session.user.id,
      session.user.email || '',
      level || 'intermediate',
      terrain || 'mixed',
      parseInt(dist || '10', 10),
      mode,
      session.user.user_metadata?.name
    );
    if (saveError) {
      setError(saveError.message);
      setLoading(false);
      return;
    }
    await refreshProfile();
    // RootNavigator détecte needsOnboarding=false et route vers AppTabs automatiquement.
  }

  function handleFinish() {
    if (!choices.dist) {
      setError('Fais un choix');
      return;
    }
    finish();
  }

  function handleSkip() {
    finish(choices.level || 'intermediate', choices.terrain || 'mixed', choices.dist || '10');
  }

  return (
    <OnboardingStepLayout step={3} title="Distance habituelle" subtitle="Pour préremplir la distance cible">
      <ChoiceGrid options={DIST_OPTIONS} value={choices.dist} onSelect={(v) => { setChoice('dist', v); setError(''); }} columns={2} />
      {!!error && <Text style={[styles.error, { color: tokens.danger }]}>{error}</Text>}
      <View style={styles.actions}>
        <Button title="Commencer" icon="arrow-right" iconPosition="right" onPress={handleFinish} loading={loading} />
        <Button title="Retour" icon="arrow-left" variant="secondary" onPress={() => navigation.goBack()} disabled={loading} />
        <Button title="Passer" variant="text" onPress={handleSkip} disabled={loading} />
      </View>
    </OnboardingStepLayout>
  );
}

const styles = StyleSheet.create({
  error: { fontSize: 13, marginTop: 8 },
  actions: { marginTop: 20, gap: 8 },
});
