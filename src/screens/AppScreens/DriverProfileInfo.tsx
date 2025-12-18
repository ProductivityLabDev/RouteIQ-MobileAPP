import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import AppLayout from '../../layout/AppLayout';
import AppHeader from '../../components/AppHeader';
import {AppColors} from '../../utils/color';
import AppStyles from '../../styles/AppStyles';
import {hp} from '../../utils/constants';
import AppButton from '../../components/AppButton';
import {useNavigation} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {saveToken} from '../../store/user/userSlices';
import {fetchDriverDetails} from '../../store/driver/driverSlices';

const DriverProfileInfo = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const token = useAppSelector(state => state.userSlices.token);
  const role = useAppSelector(state => state.userSlices.role);
  const employeeId = useAppSelector(state => state.userSlices.employeeId);
  const driverDetails = useAppSelector(state => state.driverSlices.driverDetails);

  React.useEffect(() => {
    if (role !== 'Driver') return;
    if (!employeeId) return;
    // Request deduping is handled in the thunk condition
    dispatch(fetchDriverDetails(employeeId));
  }, [dispatch, employeeId, role]);

  return (
    <AppLayout
      statusbackgroundColor={AppColors.red}
      style={{backgroundColor: AppColors.white}}>
      <AppHeader
        role="Driver"
        title="Profile Info"
        enableBack={true}
        rightIcon={false}
      />
      <View style={[AppStyles.driverContainer, AppStyles.flexBetween]}>
        <View>
          <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>Name</Text>
            <Text style={[AppStyles.subTitle, AppStyles.halfWidth]}>
              {driverDetails?.EmployeeName ||
                driverDetails?.name ||
                driverDetails?.fullName ||
                '—'}
            </Text>
          </View>
          <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>Age</Text>
            <Text style={[AppStyles.subTitle, AppStyles.halfWidth]}>
              {driverDetails?.Age ?? '—'}
            </Text>
          </View>
          <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>Email</Text>
            <Text style={[AppStyles.subTitle, AppStyles.halfWidth]}>
              {driverDetails?.Email || '—'}
            </Text>
          </View>
          <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>
              Phone Number
            </Text>
            <Text style={[AppStyles.subTitle, AppStyles.halfWidth]}>
              {driverDetails?.Phone || '—'}
            </Text>
          </View>
          <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>Address</Text>
            <Text style={[AppStyles.subTitle, AppStyles.halfWidth]}>
              {driverDetails?.Address || '—'}
            </Text>
          </View>
        </View>
        {role === 'Driver' && (
          <View>
            <AppButton
              onPress={() =>
                navigation.navigate('UpdateDriveProfile' as never, {
                  driverDetails,
                } as never)
              }
              title="Edit Info"
              style={styles.button}
              titleStyle={styles.buttonTitle}
            />
            <AppButton
              title="Confirm"
              style={{alignSelf: 'center', width: '100%'}}
              onPress={() => {
                console.log(token, 'token');

                token || token == 1
                  ? navigation.goBack()
                  : dispatch(saveToken(1));
              }}
            />
          </View>
        )}
      </View>
    </AppLayout>
  );
};

export default DriverProfileInfo;

const styles = StyleSheet.create({
  button: {
    width: '100%',
    backgroundColor: AppColors.white,
    borderColor: AppColors.red,
    borderWidth: 1.5,
    marginBottom: hp(2),
    alignSelf: 'center',
  },
  buttonTitle: {
    color: AppColors.black,
  },
});
