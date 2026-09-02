import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon, IconName } from './Icon';
import { useTheme } from '../../theme/ThemeContext';
import { fonts, radii } from '../../theme/tokens';

type Variant = 'primary' | 'secondary' | 'text';
type FeatherName = IconName;

/** Dégradé diagonal clair→plus soutenu sur le lime — donne du relief au bouton principal plutôt
 * qu'un aplat plat (déjà utilisé partout ailleurs). */
const PRIMARY_GRADIENT = ['#F6FF9E', '#F0FB6B', '#D9E85B'] as const;

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: Variant;
  icon?: FeatherName;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const { tokens } = useTheme();
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const textColor = isPrimary ? tokens.onAccent : isSecondary ? tokens.text : tokens.text2;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isSecondary && { backgroundColor: tokens.surface2, borderWidth: 1, borderColor: tokens.border2 },
        variant === 'text' && styles.text,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {isPrimary && <LinearGradient colors={PRIMARY_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />}
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon && iconPosition === 'left' && <Icon name={icon} size={16} color={textColor} style={styles.iconLeft} />}
          <Text
            style={[
              styles.label,
              { color: textColor },
              variant === 'text' && styles.labelText,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && <Icon name={icon} size={16} color={textColor} style={styles.iconRight} />}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    height: 56,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    overflow: 'hidden',
  },
  text: { backgroundColor: 'transparent', height: 'auto', paddingVertical: 8 },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  label: { fontSize: 15, fontFamily: fonts.mono, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase' },
  labelText: { fontSize: 13, textTransform: 'none' },
  iconLeft: { marginRight: 8 },
  iconRight: { marginLeft: 8 },
});
