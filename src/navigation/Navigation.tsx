import {NavigationContainer} from '@react-navigation/native';
import React, {useState} from 'react';
import SplashScreen from '../screens/AppScreens/SplashScreen';
import {AppStack, AuthStack} from './Stack';
import {useAppSelector} from '../store/hooks';

const Navigation = () => {
  const token = useAppSelector(state => state.userSlices.token);
  const [Splash, setSplash] = useState(true);

  setTimeout(() => {
    setSplash(false);
  }, 1000);

  return (
    <NavigationContainer>
      {Splash ? <SplashScreen /> : token ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};
export default Navigation;
