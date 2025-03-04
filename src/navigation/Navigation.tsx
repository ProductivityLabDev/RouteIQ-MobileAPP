import { NavigationContainer } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import SplashScreen from '../screens/AppScreens/SplashScreen';
import { AppStack, AuthStack, DriverStack, RetailStack } from './Stack';
import { useAppSelector } from '../store/hooks';

const Navigation = () => {
  const token = useAppSelector(state => state.userSlices.token);
  const role = useAppSelector(state => state.userSlices.role);
  const [Splash, setSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplash(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <NavigationContainer>
      { Splash ? <SplashScreen /> : token ? role === 'Driver' ? <DriverStack /> : role === 'Retail' ? <RetailStack /> : <AppStack /> : <AuthStack /> }
    </NavigationContainer>
  );
};

export default Navigation;
