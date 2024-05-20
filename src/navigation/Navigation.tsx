import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {AuthStack} from './Stack';

const Navigation = () => {
  return (
    <NavigationContainer>
      <AuthStack />
    </NavigationContainer>
  );
};
export default Navigation;
