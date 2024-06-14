import React, {useState} from 'react';
import AppHeader from '../../components/AppHeader';
import AppLayout from '../../layout/AppLayout';
import {AppColors} from '../../utils/color';
import {useAppSelector} from '../../store/hooks';
import AppStyles from '../../styles/AppStyles';
import {StyleSheet, View} from 'react-native';
import AppInput from '../../components/AppInput';
import {hp} from '../../utils/constants';
import AppFonts from '../../utils/appFonts';

const DriverMaintenanceDetail = () => {
  const maintenanceDetail = useAppSelector(
    state => state.driverSlices.maintenanceDetail,
  );
  const [mileage, setMileage] = useState('201569');

  return (
    <AppLayout
      statusbackgroundColor={AppColors.red}
      style={{backgroundColor: AppColors.driverScreen}}
      alarmIcon={true}>
      <AppHeader
        role="Driver"
        title={maintenanceDetail || ''}
        enableBack={true}
        rightIcon={true}
      />
      <View style={AppStyles.driverContainer}>
        <View>
          <AppInput
            label="Enter Current Mileage"
            value={mileage}
            onChangeText={(text: string) => setMileage(text)}
            keyboardType="number-pad"
            containerStyle={styles.containerStyle}
            inputStyle={styles.inputStyle}
            labelStyle={styles.labelStyle}
          />
        </View>
      </View>
    </AppLayout>
  );
};

export default DriverMaintenanceDetail;

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: AppColors.white,
    padding: hp(2),
    borderRadius: 16,
  },
  inputStyle: {
    height: hp(5.5),
  },
  labelStyle: {
    fontFamily: AppFonts.NunitoSansSemiBold,
  },
});
