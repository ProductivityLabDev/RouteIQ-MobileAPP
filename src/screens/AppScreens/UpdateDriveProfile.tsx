import {ScrollView, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import AppLayout from '../../layout/AppLayout';
import AppHeader from '../../components/AppHeader';
import {AppColors} from '../../utils/color';
import AppStyles from '../../styles/AppStyles';
import {hp} from '../../utils/constants';
import AppButton from '../../components/AppButton';
import AppInput from '../../components/AppInput';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Controller, useForm} from 'react-hook-form';

const UpdateDriveProfile = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const driverDetails = route?.params?.driverDetails;

  const {
    control,
    handleSubmit,
    setValue,
    formState: {errors},
  } = useForm({
    defaultValues: {
      name: '',
      age: '',
      email: '',
      phoneNumber: '',
      address: '',
    },
  });

  useEffect(() => {
    // Prefill from API-backed details if provided; otherwise fallback to existing static defaults.
    const name =
      driverDetails?.EmployeeName ??
      driverDetails?.name ??
      driverDetails?.fullName ??
      'Mark Tommay';
    const age =
      driverDetails?.Age != null ? String(driverDetails.Age) : '32';
    const email = driverDetails?.Email ?? 'marktommay@gmail.com';
    const phoneNumber = driverDetails?.Phone ?? '+1-424-271-8337';
    const address = driverDetails?.Address ?? '802 E Frierson Ave, Tampa, FL 33603';

    setValue('name', name);
    setValue('age', age);
    setValue('email', email);
    setValue('phoneNumber', phoneNumber);
    setValue('address', address);
  }, [driverDetails, setValue]);

  const onSubmit = () => {
    navigation.goBack();
  };

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
      <ScrollView
        contentContainerStyle={[
          AppStyles.driverContainer,
          AppStyles.flexBetween,
        ]}>
        <View>
          <View style={[AppStyles.rowBetween]}>
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>Name</Text>
            <Controller
              name="name"
              control={control}
              rules={{required: 'Name is required'}}
              render={({field: {onChange, value}}) => (
                <AppInput
                  value={value}
                  containerStyle={AppStyles.halfWidth}
                  container={[styles.inputContainer, {height: 40}]}
                  inputStyle={styles.inputStyle}
                  onChangeText={text => onChange(text)}
                  error={errors.name?.message}
                />
              )}
            />
          </View>
          <View style={[AppStyles.rowBetween]}>
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>Age</Text>
            <Controller
              name="age"
              control={control}
              rules={{required: 'Age is required'}}
              render={({field: {onChange, value}}) => (
                <AppInput
                  value={value}
                  containerStyle={AppStyles.halfWidth}
                  keyboardType="number-pad"
                  container={[styles.inputContainer, {height: 40}]}
                  inputStyle={styles.inputStyle}
                  onChangeText={text => onChange(text)}
                  error={errors.age?.message}
                />
              )}
            />
          </View>
          <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>Email</Text>
            <Controller
              name="email"
              control={control}
              rules={{required: 'Email is required'}}
              render={({field: {onChange, value}}) => (
                <AppInput
                  value={value}
                  containerStyle={[AppStyles.halfWidth]}
                  container={styles.inputContainer}
                  inputStyle={styles.inputStyle}
                  multiline={true}
                  onChangeText={text => onChange(text)}
                  error={errors.email?.message}
                />
              )}
            />
          </View>
          <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>
              Phone Number
            </Text>
            <Controller
              name="phoneNumber"
              control={control}
              rules={{required: 'Phone Number is required'}}
              render={({field: {onChange, value}}) => (
                <AppInput
                  value={value}
                  containerStyle={AppStyles.halfWidth}
                  keyboardType="number-pad"
                  container={[styles.inputContainer, {height: 40}]}
                  inputStyle={styles.inputStyle}
                  onChangeText={text => onChange(text)}
                  error={errors.phoneNumber?.message}
                />
              )}
            />
          </View>
          <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>Address</Text>
            <Controller
              name="address"
              control={control}
              rules={{required: 'Address is required'}}
              render={({field: {onChange, value}}) => (
                <AppInput
                  value={value}
                  containerStyle={[AppStyles.halfWidth]}
                  container={styles.inputContainer}
                  inputStyle={styles.inputStyle}
                  multiline={true}
                  onChangeText={text => onChange(text)}
                  error={errors.address?.message}
                />
              )}
            />
          </View>
        </View>
        <View>
          <AppButton
            title="Update"
            style={{width: '100%', alignSelf: 'center'}}
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      </ScrollView>
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
    borderRadius: 5,
  },
  inputStyle: {color: AppColors.graySuit},
});
