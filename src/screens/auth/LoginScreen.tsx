import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextField } from '../../components/ui/TextField';
import { Button } from '../../components/ui/Button';
import { signIn } from '../../lib/supabase/auth';
import { useTheme } from '../../theme/ThemeContext';
import { fonts } from '../../theme/tokens';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

/** Port de doLogin (index.html:3127-3138) — la session déclenche le routage via AuthContext. */
export function LoginScreen({ navigation }: Props) {
  const { tokens } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');
    if (!email.trim() || !password) {
      setError('Email et mot de passe requis.');
      return;
    }
    setLoading(true);
    const { error: signInError } = await signIn(email.trim(), password);
    setLoading(false);
    if (signInError) setError(signInError.message);
    // Pas de navigation manuelle : AuthProvider détecte la nouvelle session et RootNavigator route automatiquement.
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: tokens.bg }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={[styles.brand, { color: tokens.text2, fontFamily: fonts.mono }]}>RUNNING LINE</Text>
          <Text style={[styles.title, { color: tokens.text, fontFamily: fonts.display }]}>
            TROUVE TON PROCHAIN{'\n'}TERRAIN DE JEU.
          </Text>
          <Text style={[styles.subtitle, { color: tokens.text2 }]}>Des parcours uniques générés autour de toi, en quelques secondes.</Text>

          <View style={[styles.card, { backgroundColor: tokens.surface }]}>
            <Text style={[styles.cardTitle, { color: tokens.text, fontFamily: fonts.display }]}>CONNEXION</Text>
            <Text style={[styles.cardSubtitle, { color: tokens.text2 }]}>Content de te revoir</Text>

            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="ton@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            <TextField
              label="Mot de passe"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              autoComplete="password"
            />

            {!!error && <Text style={[styles.error, { color: tokens.danger }]}>{error}</Text>}

            <Button title="Se connecter" onPress={handleLogin} loading={loading} style={styles.submit} />
            <Button title="Mot de passe oublié ?" variant="text" onPress={() => navigation.navigate('ForgotPassword')} />

            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: tokens.text2 }]}>Pas de compte ? </Text>
              <Button title="S'inscrire gratuitement" variant="text" onPress={() => navigation.navigate('Register')} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: 24, paddingTop: 24, gap: 8 },
  brand: { textAlign: 'center', fontSize: 12, letterSpacing: 2, marginBottom: 8 },
  title: { textAlign: 'center', fontSize: 30, lineHeight: 34 },
  subtitle: { textAlign: 'center', fontSize: 14, marginTop: 8, marginBottom: 24 },
  card: { borderRadius: 28, padding: 24, gap: 14 },
  cardTitle: { fontSize: 22 },
  cardSubtitle: { fontSize: 14, marginBottom: 6 },
  error: { fontSize: 13 },
  submit: { marginTop: 8 },
  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' },
  footerText: { fontSize: 13 },
});
