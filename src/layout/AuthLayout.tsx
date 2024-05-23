import React from 'react';
import { ImageBackground, StatusBar, StyleSheet, View } from 'react-native';
import AppStyles from '../styles/AppStyles';
import { AuthLayoutProps } from '../types/types';
import { hp } from '../utils/constants';
import { BlurView } from '@react-native-community/blur';

const AuthLayout: React.FC<AuthLayoutProps> = ({children}) => {
  return (
    <ImageBackground style={AppStyles.screenWidthHeight} source={require('../assets/images/Splash_background.png')}>
      <StatusBar translucent={true} backgroundColor='transparent' barStyle={'dark-content'} />
      {/* <BlurView
        style={styles.absolute}
        blurType="light"
        blurAmount={1}
        reducedTransparencyFallbackColor="white"
      /> */}
      <View style={styles.childContainer}>{children}</View>
    </ImageBackground>
  );
};

export default AuthLayout;

const styles = StyleSheet.create({
    childContainer: {
        paddingHorizontal: hp(2),
        paddingTop: hp(4)
    },
    absolute: {
      position: "absolute",
      top: 0,
      left: 0,
      bottom: 0,
      right: 0
    }
})