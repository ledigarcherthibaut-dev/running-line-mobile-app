import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawRouteScreen } from '../screens/draw/DrawRouteScreen';
import { GenerateResultsScreen } from '../screens/generate/GenerateResultsScreen';
import { GenerateScreen } from '../screens/generate/GenerateScreen';
import { RouteDetailScreen } from '../screens/routes/RouteDetailScreen';
import { GenerateProvider } from '../state/GenerateContext';
import { useAuth } from '../state/AuthContext';
import { ProfileHeaderButton } from '../components/ProfileHeaderButton';
import type { GenerateStackParamList } from './types';

const Stack = createNativeStackNavigator<GenerateStackParamList>();

export function GenerateStack() {
  const { profile } = useAuth();
  const defaultTerrain = profile?.preferred_terrain && profile.preferred_terrain !== 'any' ? profile.preferred_terrain : 'mixed';
  const defaultDistance = profile?.preferred_dist || 15;

  return (
    <GenerateProvider defaultTerrain={defaultTerrain} defaultDistance={defaultDistance}>
      <Stack.Navigator>
        <Stack.Screen
          name="GenerateScreen"
          component={GenerateScreen}
          options={{ title: 'Générer', headerRight: () => <ProfileHeaderButton /> }}
        />
        <Stack.Screen name="DrawRoute" component={DrawRouteScreen} options={{ title: 'Dessin manuel' }} />
        <Stack.Screen name="GenerateResults" component={GenerateResultsScreen} options={{ title: 'Résultats' }} />
        <Stack.Screen name="RouteDetail" component={RouteDetailScreen} options={{ title: 'Parcours' }} />
      </Stack.Navigator>
    </GenerateProvider>
  );
}
