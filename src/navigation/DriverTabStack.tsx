import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigationTypes';
import DriverHomeScreen from '../screens/AppScreens/DriverHomeScreen';
import DriverStudentsScreen from '../screens/AppScreens/DriverStudentsScreen';
import DriverChatScreen from '../screens/AppScreens/DriverChatScreen';
import DriverProfile from '../screens/AppScreens/DriverProfile';
import DriverInspection from '../screens/AppScreens/DriverInspection';
import DriverMapView from '../screens/AppScreens/DriverMapView';
import DriverMaintenanceDetail from '../screens/AppScreens/DriverMaintenanceDetail';
import DriverMaintenanceScreen from '../screens/AppScreens/DriverMaintenanceScreen';
import DriverStudentDetail from '../screens/AppScreens/DriverStudentDetail';
import DriverChats from '../screens/AppScreens/DriverChats';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="DriverHomeScreen" component={DriverHomeScreen} />
      <Stack.Screen name="DriverInspection" component={DriverInspection} />
      <Stack.Screen name="DriverMapView" component={DriverMapView} />
    </Stack.Navigator>
  );
};

export const TasksStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="DriverMaintenanceScreen" component={DriverMaintenanceScreen} />
      <Stack.Screen name="DriverMaintenanceDetail" component={DriverMaintenanceDetail} />
    </Stack.Navigator>
  );
};

export const StudentStack = () => {
    return (
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="DriverStudentsScreen" component={DriverStudentsScreen} />
        <Stack.Screen name="DriverStudentDetail" component={DriverStudentDetail} />
      </Stack.Navigator>
    );
  };

  export const ChatStack = () => {
    return (
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="DriverChats" component={DriverChats} />
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
  