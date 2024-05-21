
import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { AuthLayoutProps } from '../types/types';
import { AppColors } from '../utils/color';
import { hp } from '../utils/constants';

const AppLayout: React.FC<AuthLayoutProps> = ({children}) => {
  return (
    <View style={{flex: 1}}>
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