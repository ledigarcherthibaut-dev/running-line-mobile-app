import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/home/HomeScreen';
import { RouteDetailScreen } from '../screens/routes/RouteDetailScreen';
import { ProfileHeaderButton } from '../components/ProfileHeaderButton';
import type { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ title: 'Accueil', headerRight: () => <ProfileHeaderButton /> }}
      />
      <Stack.Screen name="RouteDetail" component={RouteDetailScreen} options={{ title: 'Parcours' }} />
    </Stack.Navigator>
  );
}
