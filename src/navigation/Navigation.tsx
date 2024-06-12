import {NavigationContainer} from '@react-navigation/native';
import React, {useState} from 'react';
import SplashScreen from '../screens/AppScreens/SplashScreen';
import {AppStack, AuthStack, DriverStack} from './Stack';
import {useAppSelector} from '../store/hooks';

const Navigation = () => {
  const token = useAppSelector(state => state.userSlices.token);
  const role = useAppSelector(state => state.userSlices.role);
  const [Splash, setSplash] = useState(true);

  setTimeout(() => {
    setSplash(false);
  }, 1000);
console.log(role);

  return (
    <NavigationContainer>
      {Splash ? <SplashScreen /> : token ? role == 'Driver' ? <DriverStack /> : <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};
export default Navigation;
