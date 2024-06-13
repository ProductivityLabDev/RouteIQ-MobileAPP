import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigationTypes';
import DriverHomeScreen from '../screens/AppScreens/DriverHomeScreen';
import DriverTasksScreen from '../screens/AppScreens/DriverTasksScreen';
import DriverStudentsScreen from '../screens/AppScreens/DriverStudentsScreen';
import DriverChatScreen from '../screens/AppScreens/DriverChatScreen';
import DriverProfile from '../screens/AppScreens/DriverProfile';
import DriverInspection from '../screens/AppScreens/DriverInspection';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="DriverHomeScreen" component={DriverHomeScreen} />
      <Stack.Screen name="DriverInspection" component={DriverInspection} />
    </Stack.Navigator>
  );
};

export const TasksStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="DriverTasksScreen" component={DriverTasksScreen} />
    </Stack.Navigator>
  );
};

export const StudentStack = () => {
    return (
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="DriverStudentsScreen" component={DriverStudentsScreen} />
      </Stack.Navigator>
    );
  };

  export const ChatStack = () => {
    return (
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="DriverChatScreen" component={DriverChatScreen} />
      </Stack.Navigator>
    );
  };

  export const ProfileStack = () => {
    return (
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="DriverProfile" component={DriverProfile} />
      </Stack.Navigator>
    );
  };
  