import { Pressable, StyleSheet, Text, View } from 'react-native';
import { signOut } from '../../lib/supabase/auth';
import { useAuth } from '../../state/AuthContext';
import { useTheme } from '../../theme/ThemeContext';

export function AccountScreen() {
  const { tokens, mode, cycleMode } = useTheme();
  const { session } = useAuth();

  return (
    <View style={[styles.container, { backgroundColor: tokens.bg }]}>
      <Text style={[styles.title, { color: tokens.text }]}>Compte</Text>
      <Text style={{ color: tokens.text2 }}>{session?.user.email}</Text>

      <Pressable style={[styles.button, { backgroundColor: tokens.surface2 }]} onPress={cycleMode}>
        <Text style={{ color: tokens.text }}>Thème : {mode}</Text>
      </Pressable>

      <Pressable style={[styles.button, { backgroundColor: tokens.danger }]} onPress={() => signOut()}>
        <Text style={styles.buttonText}>Se déconnecter</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  title: { fontSize: 20, fontWeight: '700' },
  button: { borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
});
