import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import CleanBusIcon from '../../assets/svgs/CleanBusIcon';
import FuelIcon from '../../assets/svgs/FuelIcon';
import MeterIcon from '../../assets/svgs/MeterIcon';
import AppHeader from '../../components/AppHeader';
import AppLayout from '../../layout/AppLayout';
import {setMaintenanceDetail} from '../../store/driver/driverSlices';
import {useAppDispatch} from '../../store/hooks';
import AppStyles from '../../styles/AppStyles';
import {AppColors} from '../../utils/color';
import {hp} from '../../utils/constants';
import {size} from '../../utils/responsiveFonts';

const DriverMaintenanceScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const maintenance_data = [
    {
      title: 'Fuel',
      icon: <FuelIcon />,
    },
    {
      title: 'Cleaning',
      icon: <CleanBusIcon />,
    },
    {
      title: 'Mileage Record',
      icon: <MeterIcon />,
    },
  ];

  return (
    <AppLayout
      statusbackgroundColor={AppColors.red}
      style={{backgroundColor: AppColors.driverScreen}}
      alarmIcon={true}>
      <AppHeader
        role="Driver"
        title="Maintenance"
        enableBack={false}
        rightIcon={true}
        profile_image={true}
      />
      <View style={AppStyles.driverContainer}>
        <Text style={[AppStyles.titleHead, {fontSize: size.vxlg}]}>
          Inspections & Maintenance Tasks
        </Text>

        <View
          style={[
            AppStyles.rowBetween,
            {
              flexWrap: 'wrap',
              marginTop: hp(1.5),
            },
          ]}>
          {maintenance_data.map((item, index) => {
            return (
              <Pressable
                key={index}
                onPress={() => {
                  dispatch(setMaintenanceDetail(item?.title));
                  navigation.navigate('DriverMaintenanceDetail');
                }}
                style={styles.cardContainer}>
                <Text style={[AppStyles.titleHead, {fontSize: size.lg}]}>
                  {item?.title}
                </Text>
                <View style={styles.icon}>{item?.icon}</View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </AppLayout>
  );
};

export default DriverMaintenanceScreen;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: AppColors.white,
    width: '47%',
    justifyContent: 'space-between',
    paddingVertical: hp(1.5),
    paddingHorizontal: hp(1.5),
    borderRadius: 15,
    gap: 15,
    marginVertical: hp(1),
  },
  icon: {alignSelf: 'flex-end'},
});
