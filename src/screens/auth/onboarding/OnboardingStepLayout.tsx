import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeContext';
import { fonts } from '../../../theme/tokens';

const TOTAL_STEPS = 3;

/** Port de #ob-dots + .ob-step-title/.ob-step-sub (index.html:2072-2117). */
export function OnboardingStepLayout({
  step,
  title,
  subtitle,
  children,
}: {
  step: 1 | 2 | 3;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const { tokens } = useTheme();
  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: tokens.bg }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.progressRow}>
          <Text style={[styles.progressLabel, { color: tokens.text3, fontFamily: fonts.mono }]}>
            ÉTAPE {step}/{TOTAL_STEPS}
          </Text>
          <View style={[styles.progressTrack, { backgroundColor: tokens.border2 }]}>
            <View style={[styles.progressFill, { backgroundColor: tokens.accent, width: `${(step / TOTAL_STEPS) * 100}%` }]} />
          </View>
        </View>
        <Text style={[styles.title, { color: tokens.text, fontFamily: fonts.display }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: tokens.text2 }]}>{subtitle}</Text>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: 24, paddingTop: 24 },
  progressRow: { gap: 8, marginBottom: 28 },
  progressLabel: { fontSize: 10.5, letterSpacing: 1 },
  progressTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, borderRadius: 2 },
  title: { fontSize: 22, textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 13, textAlign: 'center', marginBottom: 24 },
});
