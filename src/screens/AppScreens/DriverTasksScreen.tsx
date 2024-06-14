import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import AppHeader from '../../components/AppHeader';
import AppLayout from '../../layout/AppLayout';
import {AppColors} from '../../utils/color';
import AppStyles from '../../styles/AppStyles';
import {size} from '../../utils/responsiveFonts';
import FuelIcon from '../../assets/svgs/FuelIcon';
import {hp} from '../../utils/constants';
import CleanBusIcon from '../../assets/svgs/CleanBusIcon';
import MeterIcon from '../../assets/svgs/MeterIcon';
import {useNavigation} from '@react-navigation/native';
import {useAppDispatch} from '../../store/hooks';
import {setMaintenanceDetail} from '../../store/driver/driverSlices';

const DriverTasksScreen = () => {
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

export default DriverTasksScreen;

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
