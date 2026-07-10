import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { fonts, radii } from '../../theme/tokens';

type Variant = 'primary' | 'secondary' | 'text';

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const { tokens } = useTheme();
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isPrimary && { backgroundColor: tokens.accent },
        isSecondary && { backgroundColor: tokens.surface2, borderWidth: 1, borderColor: tokens.border2 },
        variant === 'text' && styles.text,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? tokens.text : tokens.text2} />
      ) : (
        <Text
          style={[
            styles.label,
            { color: isPrimary || isSecondary ? tokens.text : tokens.text2 },
            variant === 'text' && styles.labelText,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  text: { backgroundColor: 'transparent', height: 'auto', paddingVertical: 8 },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  label: { fontSize: 15, fontFamily: fonts.mono, fontWeight: '600', letterSpacing: 0.3, textTransform: 'uppercase' },
  labelText: { fontSize: 13, textTransform: 'none' },
});
