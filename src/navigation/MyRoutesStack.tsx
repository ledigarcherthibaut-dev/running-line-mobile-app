import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MyRoutesScreen } from '../screens/routes/MyRoutesScreen';
import { RouteDetailScreen } from '../screens/routes/RouteDetailScreen';
import type { MyRoutesStackParamList } from './types';

const Stack = createNativeStackNavigator<MyRoutesStackParamList>();

export function MyRoutesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MyRoutesScreen" component={MyRoutesScreen} options={{ title: 'Mes parcours' }} />
      <Stack.Screen name="RouteDetail" component={RouteDetailScreen} options={{ title: 'Parcours' }} />
    </Stack.Navigator>
  );
}
