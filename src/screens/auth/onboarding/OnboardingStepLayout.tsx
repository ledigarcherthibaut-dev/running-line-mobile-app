import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeContext';
import { fonts } from '../../../theme/tokens';

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
        <View style={styles.dots}>
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: tokens.border2 },
                i === step && { backgroundColor: tokens.accent, width: 22 },
              ]}
            />
          ))}
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
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 28 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  title: { fontSize: 22, textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 13, textAlign: 'center', marginBottom: 24 },
});
