import { StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../../theme/ThemeContext';
import { fonts } from '../../theme/tokens';

/** Port des .mc-range (sliders distance/D+/allure) du panneau de génération. */
export function SliderField({
  label,
  value,
  onValueChange,
  minimumValue,
  maximumValue,
  step,
  formatValue,
}: {
  label: string;
  value: number;
  onValueChange: (v: number) => void;
  minimumValue: number;
  maximumValue: number;
  step: number;
  formatValue: (v: number) => string;
}) {
  const { tokens } = useTheme();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: tokens.text3 }]}>{label.toUpperCase()}</Text>
        <Text style={[styles.value, { color: tokens.text }]}>{formatValue(value)}</Text>
      </View>
      <Slider
        value={value}
        onValueChange={onValueChange}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        minimumTrackTintColor={tokens.accent}
        maximumTrackTintColor={tokens.border2}
        thumbTintColor={tokens.text}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 11, fontFamily: fonts.mono, letterSpacing: 0.5 },
  value: { fontSize: 13, fontFamily: fonts.mono, fontWeight: '600' },
});
