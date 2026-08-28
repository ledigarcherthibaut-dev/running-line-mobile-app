import { Pressable, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../state/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { fonts } from '../theme/tokens';
import { RootStackParamList } from '../navigation/types';

/** Bouton profil dans le header — ouvre le Compte (écran racine, hors des onglets). */
export function ProfileHeaderButton() {
  const navigation = useNavigation();
  const { tokens } = useTheme();
  const { session, profile } = useAuth();
  const initial = (profile?.name?.[0] || session?.user.email?.[0] || '?').toUpperCase();

  function openAccount() {
    // navigation ici = le Stack imbriqué dans l'onglet ; il faut remonter 2 niveaux
    // (Tab.Navigator puis Root Stack) pour atteindre 'Account', défini sur la racine.
    navigation.getParent()?.getParent<NativeStackNavigationProp<RootStackParamList>>()?.navigate('Account');
  }

  return (
    <Pressable
      onPress={openAccount}
      style={[styles.btn, { backgroundColor: tokens.accent, borderColor: tokens.secondary }]}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Ouvrir mon compte"
    >
      <Text style={[styles.text, { color: tokens.onAccent, fontFamily: fonts.display }]}>{initial}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1.5,
  },
  text: { fontSize: 14 },
});
