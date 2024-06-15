import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import AppLayout from '../../layout/AppLayout';
import AppHeader from '../../components/AppHeader';
import {AppColors} from '../../utils/color';
import AppStyles from '../../styles/AppStyles';
import {hp} from '../../utils/constants';
import AppButton from '../../components/AppButton';
import AppInput from '../../components/AppInput';

const UpdateDriveProfile = () => {
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
          <View style={[AppStyles.rowBetween]}>
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>Name</Text>
            <AppInput
              value="Mark Tommay"
              containerStyle={AppStyles.halfWidth}
              container={[styles.inputContainer, {height: 40}]}
              inputStyle={styles.inputStyle}
            />
          </View>
          <View style={[AppStyles.rowBetween]}>
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>Age</Text>
            <AppInput
              value="32"
              containerStyle={AppStyles.halfWidth}
              container={[styles.inputContainer, {height: 40}]}
              inputStyle={styles.inputStyle}
            />
          </View>
          <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>Email</Text>
            <AppInput
              value="marktommay@gmail.com"
              containerStyle={[AppStyles.halfWidth]}
              container={styles.inputContainer}
              inputStyle={styles.inputStyle}
              multiline={true}
            />
          </View>
          <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>
              Phone Number
            </Text>
            <AppInput
              value="+1-424-271-8337"
              containerStyle={AppStyles.halfWidth}
              container={[styles.inputContainer, {height: 40}]}
              inputStyle={styles.inputStyle}
            />
          </View>
          <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>Address</Text>
            <AppInput
              value="802 E Frierson Ave, Tampa, FL 33603"
              containerStyle={[AppStyles.halfWidth]}
              container={styles.inputContainer}
              inputStyle={styles.inputStyle}
              multiline={true}
            />
          </View>
        </View>
        <View>
          <AppButton title="Update" style={{width: '100%', alignSelf: 'center'}} />
        </View>
      </View>
    </AppLayout>
  );
};

export default UpdateDriveProfile;

const styles = StyleSheet.create({
  button: {
    backgroundColor: AppColors.white,
    borderColor: AppColors.red,
    borderWidth: 1.5,
    marginBottom: hp(2),
  },
  buttonTitle: {
    color: AppColors.black,
  },
  inputContainer: {
    borderColor: AppColors.graySuit,
    borderWidth: 1,
    paddingHorizontal: 2,
    borderRadius: 5
  },
  inputStyle: {color: AppColors.graySuit},
});
