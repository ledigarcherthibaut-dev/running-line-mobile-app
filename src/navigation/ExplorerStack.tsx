import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ExplorerScreen } from '../screens/explorer/ExplorerScreen';
import { TrailDetailScreen } from '../screens/explorer/TrailDetailScreen';
import { RouteDetailScreen } from '../screens/routes/RouteDetailScreen';
import type { ExplorerStackParamList } from './types';

const Stack = createNativeStackNavigator<ExplorerStackParamList>();

export function ExplorerStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ExplorerScreen" component={ExplorerScreen} options={{ title: 'Explorer' }} />
      <Stack.Screen name="TrailDetail" component={TrailDetailScreen} options={{ title: 'Sentier' }} />
      <Stack.Screen name="RouteDetail" component={RouteDetailScreen} options={{ title: 'Parcours' }} />
    </Stack.Navigator>
  );
}
