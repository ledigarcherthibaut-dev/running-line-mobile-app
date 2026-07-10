import { useCallback, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from './src/theme/ThemeContext';
import { AuthProvider } from './src/state/AuthContext';
import { RoutesProvider } from './src/state/RoutesContext';
import { ToastProvider } from './src/state/ToastContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { OfflineBanner } from './src/components/OfflineBanner';
import { fonts } from './src/theme/tokens';

SplashScreen.preventAutoHideAsync();

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
              <StatusBar style="auto" />
            </ToastProvider>
          </RoutesProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
