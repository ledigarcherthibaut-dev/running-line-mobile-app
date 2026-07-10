import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingProvider } from '../state/OnboardingContext';
import { OnboardingStep1Screen } from '../screens/auth/onboarding/OnboardingStep1Screen';
import { OnboardingStep2Screen } from '../screens/auth/onboarding/OnboardingStep2Screen';
import { OnboardingStep3Screen } from '../screens/auth/onboarding/OnboardingStep3Screen';
import type { OnboardingStackParamList } from './types';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

/**
 * 3 étapes = obChoices.level/terrain/dist (index.html:3355-3393), avec "Passer" → valeurs
 * par défaut. Séparé d'AuthStack : rendu quand session existe mais profil.level est vide
 * (needsOnboarding), cf. RootNavigator.
 */
export function OnboardingStack() {
  return (
    <OnboardingProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="OnboardingStep1" component={OnboardingStep1Screen} />
        <Stack.Screen name="OnboardingStep2" component={OnboardingStep2Screen} />
        <Stack.Screen name="OnboardingStep3" component={OnboardingStep3Screen} />
      </Stack.Navigator>
    </OnboardingProvider>
  );
}
