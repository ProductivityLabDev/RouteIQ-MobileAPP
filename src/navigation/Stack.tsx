import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import SplashScreen from '../screens/AppScreens/SplashScreen';
import {RootStackParamList} from '../types/navigationTypes';
import LoginAs from '../screens/AuthScreens/LoginAs';

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
    </Stack.Navigator>
  );
};
