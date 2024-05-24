import { NavigationContainer } from '@react-navigation/native';
import React, { useState } from 'react';
import SplashScreen from '../screens/AppScreens/SplashScreen';
import { AuthStack } from './Stack';

const Navigation = () => {
  const [Splash, setSplash] = useState(true);

  setTimeout(() => {
    setSplash(false);
  }, 1000);

  return (
    <NavigationContainer>
      {Splash ? <SplashScreen /> : <AuthStack />}
    </NavigationContainer>
  );
};
export default Navigation;
