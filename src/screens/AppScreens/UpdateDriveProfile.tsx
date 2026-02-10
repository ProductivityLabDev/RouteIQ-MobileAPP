import {ActivityIndicator, ScrollView, StyleSheet, Text, View} from 'react-native';
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
import {useAppSelector} from '../../store/hooks';
import {showSuccessToast, showErrorToast} from '../../utils/toast';
import {Platform} from 'react-native';

const getApiBaseUrl = () => {
  const manualHost = 'http://192.168.18.36:3000';
  const deviceHost =
    Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
  return manualHost?.trim() || deviceHost;
};

const UpdateDriveProfile = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const driverDetails = route?.params?.driverDetails;
  const token = useAppSelector(state => state.userSlices.token);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: {errors},
  } = useForm({
    defaultValues: {
      email: '',
      phoneNumber: '',
      address: '',
      city: '',
      zipCode: '',
    },
  });

  useEffect(() => {
    // Prefill from API-backed details if provided
    const email = driverDetails?.Email ?? driverDetails?.email ?? '';
    const phoneNumber = driverDetails?.Phone ?? driverDetails?.phone ?? '';
    const address = driverDetails?.Address ?? driverDetails?.address ?? '';
    const city = driverDetails?.City ?? driverDetails?.city ?? '';
    const zipCode = driverDetails?.ZipCode ?? driverDetails?.zipCode ?? '';

    setValue('email', email);
    setValue('phoneNumber', phoneNumber);
    setValue('address', address);
    setValue('city', city);
    setValue('zipCode', zipCode);
  }, [driverDetails, setValue]);

  const onSubmit = async (data: any) => {
    if (!token) {
      showErrorToast('Error', 'Not authenticated');
      return;
    }

    setIsSubmitting(true);
    try {
      const baseUrl = getApiBaseUrl();
      // API expects: phone=string, city=string, address, email, zipCode
      const body: Record<string, any> = {};
      if (data.email?.trim()) body.email = data.email.trim();
      if (data.phoneNumber?.trim()) body.phone = data.phoneNumber.trim(); // API field = "phone" (string)
      if (data.address?.trim()) body.address = data.address.trim();
      if (data.city?.trim()) body.city = data.city.trim(); // API field = "city" (string, not number)
      if (data.zipCode?.trim()) body.zipCode = data.zipCode.trim();

      if (__DEV__) console.log('📡 PATCH /driver/profile body:', body);

      const response = await fetch(`${baseUrl}/driver/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        let errorBody: any = null;
        try {
          errorBody = errorText ? JSON.parse(errorText) : null;
        } catch (e) {
          errorBody = null;
        }
        const message =
          errorBody?.message || errorBody?.error || errorText || 'Profile update failed';
        showErrorToast('Update Failed', typeof message === 'string' ? message : JSON.stringify(message));
        return;
      }

      showSuccessToast('Updated', 'Profile updated successfully');
      navigation.goBack();
    } catch (err) {
      if (__DEV__) console.warn('Profile update error:', err);
      showErrorToast('Error', 'Network error while updating profile');
    } finally {
      setIsSubmitting(false);
    }
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
          <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>Email</Text>
            <Controller
              name="email"
              control={control}
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
              render={({field: {onChange, value}}) => (
                <AppInput
                  value={value}
                  placeholder='+923001234567'
                  containerStyle={AppStyles.halfWidth}
                  keyboardType="phone-pad"
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
          <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>City</Text>
            <Controller
              name="city"
              control={control}
              render={({field: {onChange, value}}) => (
                <AppInput
                  value={value}
                  placeholder='City name'
                  containerStyle={AppStyles.halfWidth}
                  container={[styles.inputContainer, {height: 40}]}
                  inputStyle={styles.inputStyle}
                  onChangeText={text => onChange(text)}
                  error={errors.city?.message}
                />
              )}
            />
          </View>
          <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>Zip Code</Text>
            <Controller
              name="zipCode"
              control={control}
              render={({field: {onChange, value}}) => (
                <AppInput
                  value={value}
                  placeholder='54000'
                  containerStyle={AppStyles.halfWidth}
                  keyboardType="number-pad"
                  container={[styles.inputContainer, {height: 40}]}
                  inputStyle={styles.inputStyle}
                  onChangeText={text => onChange(text)}
                  error={errors.zipCode?.message}
                />
              )}
            />
          </View>
        </View>
        <View>
          <AppButton
            title={isSubmitting ? 'Updating...' : 'Update'}
            style={{width: '100%', alignSelf: 'center'}}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
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
