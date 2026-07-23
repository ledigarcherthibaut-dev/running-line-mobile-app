import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { fonts, radii } from '../../theme/tokens';
import { hapticSelect } from '../../lib/haptics';

export interface ChoiceOption<T extends string> {
  value: T;
  icon: keyof typeof Feather.glyphMap;
  label: string;
  sub?: string;
}

/** Port de .choice-grid / .choice-btn (index.html, styles ob-step / acc-*-choices). */
export function ChoiceGrid<T extends string>({
  options,
  value,
  onSelect,
  columns = 2,
}: {
  options: ChoiceOption<T>[];
  value?: T;
  onSelect: (value: T) => void;
  columns?: number;
}) {
  const { tokens } = useTheme();
  return (
    <View style={styles.grid}>
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => {
              hapticSelect();
              onSelect(opt.value);
            }}
            style={[
              styles.card,
              { width: `${100 / columns - 2}%`, backgroundColor: tokens.surface2, borderColor: 'transparent' },
              selected && { borderColor: tokens.text, backgroundColor: tokens.accent },
            ]}
          >
            <Feather name={opt.icon} size={22} color={tokens.text} />
            <Text style={[styles.label, { color: tokens.text }]}>{opt.label}</Text>
            {opt.sub ? <Text style={[styles.sub, { color: tokens.text3 }]}>{opt.sub}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 14,
    borderRadius: radii.md,
    borderWidth: 1.5,
  },
  label: { fontSize: 13, fontFamily: fonts.body, textAlign: 'center' },
  sub: { fontSize: 10, fontFamily: fonts.mono },
});
