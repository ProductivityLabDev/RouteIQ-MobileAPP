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

const ResetPassword = () => {
  const navigation = useNavigation();
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AuthLayout>
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={AppStyles.titleHead}>Resetting Password</Text>
            <Text
              style={[
                AppStyles.subHeading,
                {marginBottom: hp(2), textAlign: 'center'},
              ]}>
              Enter your email for the verification process. We will send 4
              digits code to your email.
            </Text>
            <View style={styles.setMargin}>
              <AppInput
                label="Email"
                placeholderTextColor={AppColors.inputGrey}
                inputStyle={styles.inputStyle}
                placeholder="Enter Email Address"
                container={styles.inputContainer}
                labelStyle={styles.inputLabelStyle}
                rightInnerIcon={
                  <GlobalIcon
                    size={20}
                    library="CustomIcon"
                    color={AppColors.inputGrey}
                    name="-icon-_email"
                  />
                }
              />
              <AppButton
                onPress={() => navigation.navigate('VerificationCode')}
                title="Continue"
                style={{marginTop: hp(10)}}
              />
            </View>
          </View>
      </AuthLayout>
    </ScrollView>
  );
};

export default ResetPassword;

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
    borderWidth: 1
  },
  inputLabelStyle: {
    color: AppColors.lightBlack,
  },
  forgotText: {
    color: AppColors.red,
    fontFamily: AppFonts.NunitoSansBold,
    fontSize: fontSize(14),
  },
});
