import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import SplashScreen from '../screens/AppScreens/SplashScreen';
import {RootStackParamList} from '../types/navigationTypes';
import LoginAs from '../screens/AuthScreens/LoginAs';
import HomeSreen from '../screens/AppScreens/HomeSreen';
import Settings from '../screens/AppScreens/Settings';
import ChildProfile from '../screens/AppScreens/ChildProfile';
import Notification from '../screens/AppScreens/Notification';
import Login from '../screens/AuthScreens/Login';
import UpdateGuardianProfile from '../screens/AppScreens/UpdateGuardianProfile';
import ChatScreen from '../screens/AppScreens/ChatScreen';
import AttendanceHistory from '../screens/AppScreens/AttendanceHistory';
import OnBoarding from '../screens/AppScreens/OnBoarding';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
    </Stack.Navigator>
  );
};

export const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="OnBoarding" component={OnBoarding} />
      <Stack.Screen name="LoginAs" component={LoginAs} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="HomeSreen" component={HomeSreen} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="ChildProfile" component={ChildProfile} />
      <Stack.Screen name="UpdateGuardianProfile" component={UpdateGuardianProfile} />
      <Stack.Screen name="Notification" component={Notification} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="AttendanceHistory" component={AttendanceHistory} />
    </Stack.Navigator>
  );
};
