import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { fonts, radii } from '../../theme/tokens';

export function TextField({ label, ...props }: { label: string } & TextInputProps) {
  const { tokens } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: tokens.text3 }]}>{label.toUpperCase()}</Text>
      <TextInput
        placeholderTextColor={tokens.text3}
        style={[styles.input, { backgroundColor: tokens.surface2, color: tokens.text }]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { fontSize: 11, fontFamily: fonts.mono, letterSpacing: 0.5 },
  input: {
    height: 50,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    fontSize: 16,
  },
});
