import React from 'react';
import { ImageBackground, StatusBar, StyleSheet, View } from 'react-native';
import AppStyles from '../styles/AppStyles';
import { AuthLayoutProps } from '../types/types';
import { hp } from '../utils/constants';

const AuthLayout: React.FC<AuthLayoutProps> = ({children}) => {
  return (
    <ImageBackground style={AppStyles.screenWidthHeight} source={require('../assets/images/Splash_background.png')}>
      <StatusBar translucent={true} backgroundColor='transparent' barStyle={'dark-content'} />
      <View style={styles.childContainer}>{children}</View>
    </ImageBackground>
  );
};

export default AuthLayout;

const styles = StyleSheet.create({
    childContainer: {
        paddingHorizontal: hp(2),
        paddingTop: hp(4)
    }
})