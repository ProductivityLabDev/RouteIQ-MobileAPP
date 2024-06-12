
import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { AppLayoutProps } from '../types/types';
import { AppColors } from '../utils/color';
import { hp, StatusBarHeight } from '../utils/constants';

const AppLayout: React.FC<AppLayoutProps> = ({children, style, statusbackgroundColor = AppColors.black}) => {
  return (
    <View style={{flex: 1}}>
      <StatusBar translucent={true} backgroundColor={statusbackgroundColor} barStyle={'light-content'} />
      <View style={[styles.childContainer, style]}>
        {children}
      </View>
    </View>
  );
};

export default AppLayout;

const styles = StyleSheet.create({
    childContainer: {
        flex:1,
        paddingTop: StatusBarHeight(),
        backgroundColor: AppColors.black,
    }
})