import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { AccountScreen } from '../screens/account/AccountScreen';
import { useAuth } from '../state/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { AppTabs } from './AppTabs';
import { AuthStack } from './AuthStack';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { session, isLoading } = useAuth();
  const { tokens, resolvedScheme } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.bg }}>
        <ActivityIndicator color={tokens.accent} />
      </View>
    );
  }

  const navigationTheme = {
    ...(resolvedScheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(resolvedScheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: tokens.bg,
      card: tokens.surface,
      text: tokens.text,
      border: tokens.border2,
      primary: tokens.accent,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      {session ? (
        <Stack.Navigator>
          <Stack.Screen name="AppTabs" component={AppTabs} options={{ headerShown: false }} />
          <Stack.Screen name="Account" component={AccountScreen} options={{ title: 'Compte' }} />
        </Stack.Navigator>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
