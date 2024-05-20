import React from 'react';
import {ImageBackground, StatusBar} from 'react-native';
import AppStyles from '../../styles/AppStyles';

const SplashScreen = () => {
  return (
    <ImageBackground
      style={AppStyles.screenWidthHeight}
      source={require('../../assets/images/Splash.png')}>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle={'dark-content'}
      />
    </ImageBackground>
  );
};

export default SplashScreen;
