
import React from 'react';
import { ImageBackground, StatusBar, StyleSheet, View } from 'react-native';
import AppStyles from '../styles/AppStyles';
import { AuthLayoutProps } from '../types/types';
import { hp } from '../utils/constants';
import { AppColors } from '../utils/color';

const AppLayout: React.FC<AuthLayoutProps> = ({children}) => {
  return (
    <View style={[AppStyles.screenWidthHeight]}>
      <StatusBar translucent={true} backgroundColor={AppColors.black} barStyle={'light-content'} />
      <View style={styles.childContainer}>
        {children}
        </View>
    </View>
  );
};

export default AppLayout;

const styles = StyleSheet.create({
    childContainer: {
      
        // paddingHorizontal: hp(2),
        flex:1,
        paddingTop: hp(4),
        backgroundColor: AppColors.black,
        // position: 'relative'

    }
})