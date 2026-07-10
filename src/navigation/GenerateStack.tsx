import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawRouteScreen } from '../screens/draw/DrawRouteScreen';
import { GenerateResultsScreen } from '../screens/generate/GenerateResultsScreen';
import { GenerateScreen } from '../screens/generate/GenerateScreen';
import { RouteDetailScreen } from '../screens/routes/RouteDetailScreen';
import type { GenerateStackParamList } from './types';

const Stack = createNativeStackNavigator<GenerateStackParamList>();

export function GenerateStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="GenerateScreen" component={GenerateScreen} options={{ title: 'Générer' }} />
      <Stack.Screen name="DrawRoute" component={DrawRouteScreen} options={{ title: 'Dessin manuel' }} />
      <Stack.Screen name="GenerateResults" component={GenerateResultsScreen} options={{ title: 'Résultats' }} />
      <Stack.Screen name="RouteDetail" component={RouteDetailScreen} options={{ title: 'Parcours' }} />
    </Stack.Navigator>
  );
}
