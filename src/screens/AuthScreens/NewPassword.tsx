import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import GlobalIcon from '../../components/GlobalIcon';
import AuthLayout from '../../layout/AuthLayout';
import AppStyles from '../../styles/AppStyles';
import AppButton from '../../components/AppButton';
import {hp, wp} from '../../utils/constants';
import {useNavigation} from '@react-navigation/native';
import AppInput from '../../components/AppInput';
import {AppColors} from '../../utils/color';
import {fontSize, size} from '../../utils/responsiveFonts';
import AppFonts from '../../utils/appFonts';

const NewPassword = () => {
  const navigation = useNavigation();
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AuthLayout>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <View style={{marginHorizontal: hp(3)}}>
            <Text style={[AppStyles.titleHead, {textAlign: 'center'}]}>
              New Password
            </Text>
            <Text
              style={[
                AppStyles.subHeading,
                {marginBottom: hp(2), textAlign: 'center'},
              ]}>
              Set the new password for your account so you can login and access
              all features.
            </Text>
          </View>
          <View style={styles.setMargin}>
            <AppInput
              label="New Password"
              placeholderTextColor={AppColors.inputGrey}
              inputStyle={styles.inputStyle}
              containerStyle={{marginBottom: hp(1.5)}}
              container={styles.inputContainer}
              labelStyle={styles.inputLabelStyle}
              placeholder="Enter New Password"
              togglePasswordVisibility={true}
              secureTextEntry={true}
              rightInnerIcon={
                <GlobalIcon
                  size={20}
                  library="CustomIcon"
                  color={AppColors.inputGrey}
                  name="-icon-_lock"
                />
              }
            />
            <AppInput
              label="Confirm Password"
              placeholderTextColor={AppColors.inputGrey}
              inputStyle={styles.inputStyle}
              containerStyle={{marginBottom: hp(0)}}
              container={styles.inputContainer}
              labelStyle={styles.inputLabelStyle}
              placeholder="Enter Confirm Password"
              togglePasswordVisibility={true}
              secureTextEntry={true}
              rightInnerIcon={
                <GlobalIcon
                  size={20}
                  library="CustomIcon"
                  color={AppColors.inputGrey}
                  name="-icon-_lock"
                />
              }
            />
            <AppButton
              onPress={() => navigation.navigate('SuccessScreen')}
              title="Update Password"
              style={{marginTop: hp(10)}}
            />
          </View>
        </View>
      </AuthLayout>
    </ScrollView>
  );
};

export default NewPassword;

const styles = StyleSheet.create({
  setMargin: {
    marginTop: hp(3),
  },
  inputStyle: {
    height: hp(6),
    marginLeft: wp(2),
    fontSize: size.md,
  },
  inputContainer: {
    borderColor: '#cfcfcf',
    borderWidth: 1,
  },
  inputLabelStyle: {
    color: AppColors.lightBlack,
  },
  forgotPassword: {
    marginBottom: hp(2.5),
    alignSelf: 'flex-end',
    padding: hp(0.5),
    paddingRight: 0,
    marginTop: hp(0.5),
  },
  forgotText: {
    color: AppColors.red,
    fontFamily: AppFonts.NunitoSansBold,
    fontSize: fontSize(14),
  },
});
