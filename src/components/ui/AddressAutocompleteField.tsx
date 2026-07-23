import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInputProps, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TextField } from './TextField';
import { useTheme } from '../../theme/ThemeContext';
import { fonts, radii } from '../../theme/tokens';
import { PlaceSuggestion, searchPlaces } from '../../lib/api/geocode';

const DEBOUNCE_MS = 400;
const MIN_CHARS = 3;

/**
 * TextField + suggestions Nominatim au fil de la frappe. Sélectionner une suggestion résout
 * les coordonnées immédiatement (évite le géocodage tardif — et son échec silencieux découvert
 * seulement après avoir lancé la génération). Taper sans sélectionner reste possible : le
 * géocodage classique reprend le relais au moment de la génération (comportement inchangé).
 */
export function AddressAutocompleteField({
  label,
  value,
  onChangeText,
  onSelectPlace,
  placeholder,
  ...inputProps
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onSelectPlace: (place: PlaceSuggestion | null) => void;
  placeholder?: string;
} & Omit<TextInputProps, 'value' | 'onChangeText' | 'placeholder'>) {
  const { tokens } = useTheme();
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);
  const lastSelectedLabel = useRef<string | null>(null);

  useEffect(() => {
    // Sélectionner une suggestion remplit le champ avec son label, ce qui redéclencherait sinon
    // une recherche pour ce même texte juste après l'avoir choisi.
    if (value === lastSelectedLabel.current) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    if (value.trim().length < MIN_CHARS) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const id = ++requestId.current;
    const timer = setTimeout(async () => {
      const results = await searchPlaces(value.trim());
      if (requestId.current === id) {
        setSuggestions(results);
        setLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value]);

  function handleChangeText(text: string) {
    lastSelectedLabel.current = null;
    onChangeText(text);
    onSelectPlace(null);
  }

  function handleSelect(place: PlaceSuggestion) {
    requestId.current++;
    lastSelectedLabel.current = place.label;
    onChangeText(place.label);
    onSelectPlace(place);
    setSuggestions([]);
    setLoading(false);
  }

  return (
    <View>
      <TextField label={label} value={value} onChangeText={handleChangeText} placeholder={placeholder} autoCorrect={false} {...inputProps} />
      {(loading || suggestions.length > 0) && (
        <View style={[styles.list, { backgroundColor: tokens.surface, borderColor: tokens.border2 }]}>
          {loading ? (
            <View style={styles.item}>
              <Text style={[styles.itemText, { color: tokens.text3 }]}>Recherche…</Text>
            </View>
          ) : (
            suggestions.map((s, i) => (
              <Pressable
                key={`${s.label}-${i}`}
                onPress={() => handleSelect(s)}
                style={[styles.item, i > 0 && { borderTopWidth: 1, borderTopColor: tokens.border }]}
                accessibilityRole="button"
              >
                <Feather name="map-pin" size={13} color={tokens.text3} />
                <Text style={[styles.itemText, { color: tokens.text }]} numberOfLines={2}>
                  {s.label}
                </Text>
              </Pressable>
            ))
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { borderRadius: radii.md, borderWidth: 1, marginTop: 4, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 12 },
  itemText: { flex: 1, fontSize: 12, fontFamily: fonts.body },
});
