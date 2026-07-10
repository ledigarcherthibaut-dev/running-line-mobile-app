import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { OnboardingStep1Screen } from '../screens/auth/onboarding/OnboardingStep1Screen';
import { OnboardingStep2Screen } from '../screens/auth/onboarding/OnboardingStep2Screen';
import { OnboardingStep3Screen } from '../screens/auth/onboarding/OnboardingStep3Screen';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="OnboardingStep1" component={OnboardingStep1Screen} />
      <Stack.Screen name="OnboardingStep2" component={OnboardingStep2Screen} options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="OnboardingStep3" component={OnboardingStep3Screen} options={{ headerShown: true, title: '' }} />
    </Stack.Navigator>
  );
}
