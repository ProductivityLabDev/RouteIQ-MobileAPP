import React from 'react';
import {StyleSheet, View} from 'react-native';
import AppHeader from '../../components/AppHeader';
import AppWeeklyCalendar from '../../components/AppWeeklyCalendar';
import AppLayout from '../../layout/AppLayout';
import AppStyles from '../../styles/AppStyles';
import {AppColors} from '../../utils/color';

const DriverHomeScreen = () => {
  return (
    <AppLayout
      statusbackgroundColor={AppColors.red}
      style={{backgroundColor: '#e6e3d8'}}>
      <AppHeader
        role="Driver"
        enableBack={false}
        rightIcon={true}
        switchIcon={true}
      />
      <View style={AppStyles.driverContainer}>
        <AppWeeklyCalendar />
      </View>
    </AppLayout>
  );
};

export default DriverHomeScreen;

const styles = StyleSheet.create({});
