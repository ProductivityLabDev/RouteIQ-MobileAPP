import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import SplashScreen from '../screens/AppScreens/SplashScreen';
import {RootStackParamList} from '../types/navigationTypes';
import LoginAs from '../screens/AuthScreens/LoginAs';
import LoginAs2 from '../screens/AuthScreens/LoginAs2';
import HomeSreen from '../screens/AppScreens/HomeSreen';
import Settings from '../screens/AppScreens/Settings';
import ChildProfile from '../screens/AppScreens/ChildProfile';
import Guardian1 from '../screens/AppScreens/Guardian1';
import Guardian2 from '../screens/AppScreens/Guardian2';
import Notification from '../screens/AppScreens/Notification';

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
      <Stack.Screen name="LoginAs" component={LoginAs} />
      <Stack.Screen name="LoginAs2" component={LoginAs2} />
      <Stack.Screen name="HomeSreen" component={HomeSreen} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="ChildProfile" component={ChildProfile} />
      <Stack.Screen name="Guardian1" component={Guardian1} />
      <Stack.Screen name="Guardian2" component={Guardian2} />
      <Stack.Screen name="Notification" component={Notification} />
    </Stack.Navigator>
  );
};
