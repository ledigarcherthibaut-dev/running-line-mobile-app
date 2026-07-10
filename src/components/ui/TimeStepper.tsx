import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { fonts, radii } from '../../theme/tokens';

const pad = (n: number) => String(n).padStart(2, '0');

/** Sélecteur d'heure simple (+/-), sans dépendance native picker (pas de rendu web disponible pour @react-native-community/datetimepicker). */
export function TimeStepper({
  hour,
  minute,
  onChange,
}: {
  hour: number;
  minute: number;
  onChange: (hour: number, minute: number) => void;
}) {
  return (
    <View style={styles.row}>
      <Unit value={hour} onDec={() => onChange((hour + 23) % 24, minute)} onInc={() => onChange((hour + 1) % 24, minute)} />
      <Colon />
      <Unit value={minute} onDec={() => onChange(hour, (minute + 55) % 60)} onInc={() => onChange(hour, (minute + 5) % 60)} />
    </View>
  );
}

function Colon() {
  const { tokens } = useTheme();
  return <Text style={[styles.colon, { color: tokens.text }]}>:</Text>;
}

function Unit({ value, onDec, onInc }: { value: number; onDec: () => void; onInc: () => void }) {
  const { tokens } = useTheme();
  return (
    <View style={styles.unit}>
      <Pressable onPress={onDec} style={[styles.stepBtn, { backgroundColor: tokens.surface2, borderColor: tokens.border2 }]}>
        <Text style={[styles.stepLabel, { color: tokens.text }]}>−</Text>
      </Pressable>
      <Text style={[styles.value, { color: tokens.text }]}>{pad(value)}</Text>
      <Pressable onPress={onInc} style={[styles.stepBtn, { backgroundColor: tokens.surface2, borderColor: tokens.border2 }]}>
        <Text style={[styles.stepLabel, { color: tokens.text }]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  unit: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepBtn: { width: 30, height: 30, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  stepLabel: { fontSize: 16, fontWeight: '700' },
  value: { fontFamily: fonts.mono, fontSize: 20, minWidth: 34, textAlign: 'center' },
  colon: { fontFamily: fonts.mono, fontSize: 20, marginHorizontal: 2 },
});
