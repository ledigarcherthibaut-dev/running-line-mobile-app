import { useCallback, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { AuthProvider } from './src/state/AuthContext';
import { RoutesProvider } from './src/state/RoutesContext';
import { ToastProvider } from './src/state/ToastContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { OfflineBanner } from './src/components/OfflineBanner';
import { fonts } from './src/theme/tokens';

SplashScreen.preventAutoHideAsync();

/** Icônes claires sur fond sombre et inversement, alignées sur le thème choisi (pas seulement le système). */
function ThemedStatusBar() {
  const { resolvedScheme } = useTheme();
  return <StatusBar style={resolvedScheme === 'dark' ? 'light' : 'dark'} />;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    [fonts.display]: require('./assets/fonts/Anton-Regular.ttf'),
    [fonts.mono]: require('./assets/fonts/RobotoMono-VariableFont_wght.ttf'),
    [fonts.body]: require('./assets/fonts/Roboto-VariableFont_wdthwght.ttf'),
  });

  const hideSplash = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    hideSplash();
  }, [hideSplash]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RoutesProvider>
            <ToastProvider>
              <RootNavigator />
              <OfflineBanner />
              <ThemedStatusBar />
            </ToastProvider>
          </RoutesProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
