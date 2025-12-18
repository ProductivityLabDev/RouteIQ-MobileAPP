import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import AppHeader from '../../components/AppHeader';
import AppInput from '../../components/AppInput';
import AppLayout from '../../layout/AppLayout';
import AppStyles from '../../styles/AppStyles';
import {AppColors} from '../../utils/color';
import {hp, wp} from '../../utils/constants';
import {size} from '../../utils/responsiveFonts';
import AppButton from '../../components/AppButton';
import {useNavigation} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {changeDriverPassword} from '../../store/driver/driverSlices';
import {logoutUser} from '../../store/user/userSlices';
import {showErrorToast, showSuccessToast} from '../../utils/toast';

const DriverChangePassword = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const changePasswordStatus = useAppSelector(
    state => state.driverSlices.changePasswordStatus,
  );
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [retypeNewPassword, setRetypeNewPassword] = React.useState('');
  const rightIcon = () => (
    <Image source={require('../../assets/images/open_lock.png')} />
  );
  return (
    <AppLayout
    statusbackgroundColor={AppColors.red}
            style={{ backgroundColor: AppColors.profileBg }}>
      <AppHeader  role="Driver"
                title={'Change Password'}
                enableBack={true}
                rightIcon={false} />
      <View
        style={[
          AppStyles.container,
          {backgroundColor: AppColors.profileBg, paddingVertical: hp(3)},
        ]}>
        <AppInput
          placeholderTextColor={AppColors.brightGrey}
          inputStyle={styles.inputStyle}
          container={styles.inputContainer}
          labelStyle={styles.inputLabelStyle}
          placeholder="Current Password"
          togglePasswordVisibility={true}
          secureTextEntry={true}
          rightInnerIcon={rightIcon()}
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        <AppInput
          placeholderTextColor={AppColors.brightGrey}
          inputStyle={styles.inputStyle}
          container={styles.inputContainer}
          labelStyle={styles.inputLabelStyle}
          placeholder="New Password"
          togglePasswordVisibility={true}
          secureTextEntry={true}
          rightInnerIcon={rightIcon()}
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <AppInput
          placeholderTextColor={AppColors.brightGrey}
          inputStyle={styles.inputStyle}
          container={styles.inputContainer}
          labelStyle={styles.inputLabelStyle}
          placeholder="Re-type New Password"
          togglePasswordVisibility={true}
          secureTextEntry={true}
          rightInnerIcon={rightIcon()}
          value={retypeNewPassword}
          onChangeText={setRetypeNewPassword}
        />
        <AppButton
          title="Submit"
          onPress={async () => {
            if (changePasswordStatus === 'loading') {
              return;
            }
            try {
              await dispatch(
                changeDriverPassword({
                  currentPassword,
                  newPassword,
                  retypeNewPassword,
                }),
              ).unwrap();
              showSuccessToast('Password changed', 'Please login again');
              dispatch(logoutUser());
            } catch (e) {
              showErrorToast('Change password failed');
            }
          }}
          style={{
            width: '100%',
            backgroundColor: AppColors.black,
            height: hp(6.5),
          }}
        />
      </View>
    </AppLayout>
  );
};

export default DriverChangePassword;

const styles = StyleSheet.create({
  inputStyle: {
    height: hp(6.5),
    marginLeft: wp(2),
    fontSize: size.md,
  },
  inputContainer: {
    borderColor: '#E2E8F0',
    borderWidth: 1,
    marginBottom: hp(1),
  },
  inputLabelStyle: {
    color: AppColors.lightBlack,
  },
});
