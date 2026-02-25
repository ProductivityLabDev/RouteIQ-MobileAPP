import {ScrollView, StyleSheet, Text, View} from 'react-native';
import React, {useEffect} from 'react';
import AppLayout from '../../layout/AppLayout';
import AppHeader from '../../components/AppHeader';
import {AppColors} from '../../utils/color';
import AppStyles from '../../styles/AppStyles';
import {hp} from '../../utils/constants';
import AppButton from '../../components/AppButton';
import AppInput from '../../components/AppInput';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Controller, useForm} from 'react-hook-form';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {updateRetailRFQ} from '../../store/retailer/retailerSlice';

const EditRetailDetail = () => {
  const navigation = useNavigation();
  const route = useRoute() as any;
  const dispatch = useAppDispatch();
  const rfqUpdateStatus = useAppSelector(state => state.retailerSlices.rfqUpdateStatus);

  const {requestId, rfq} = route.params ?? {};

  const {
    control,
    handleSubmit,
    setValue,
    formState: {errors},
  } = useForm({
    defaultValues: {
      name: '',
      phoneNumber: '',
      email: '',
      roundTrip: '',
      isWheelchairLift: '',
      nameOfLocaton: '',
      additionalDestination: '',
      specialInstructions: '',
    },
  });

  useEffect(() => {
    console.log('[EditRFQ] route params - requestId:', requestId, 'rfq:', rfq);
    if (!rfq) return;
    setValue('name', rfq.CompanyGroupName ?? rfq.companyGroupName ?? '');
    setValue('phoneNumber', rfq.Phone ?? rfq.phone ?? '');
    setValue('email', rfq.Email ?? rfq.email ?? '');
    setValue('roundTrip', rfq.IsRoundTrip || rfq.isRoundTrip ? 'Yes' : 'No');
    setValue('isWheelchairLift', rfq.WheelchairLiftRequired || rfq.wheelchairLiftRequired ? 'Yes' : 'No');
    setValue('nameOfLocaton', rfq.PickupLocation ?? rfq.pickupLocation ?? '');
    const dests = rfq.AdditionalDestinations ?? rfq.additionalDestinations ?? [];
    setValue('additionalDestination', Array.isArray(dests) ? dests[0] ?? '' : '');
    setValue('specialInstructions', rfq.SpecialInstructions ?? rfq.specialInstructions ?? '');
    console.log('[EditRFQ] pre-filled values:', {
      name: rfq.CompanyGroupName ?? rfq.companyGroupName,
      phone: rfq.Phone ?? rfq.phone,
      email: rfq.Email ?? rfq.email,
      roundTrip: rfq.IsRoundTrip ?? rfq.isRoundTrip,
      wheelchair: rfq.WheelchairLiftRequired ?? rfq.wheelchairLiftRequired,
      pickupLocation: rfq.PickupLocation ?? rfq.pickupLocation,
    });
  }, [rfq, setValue]);

  const onSubmit = async (values: any) => {
    if (rfqUpdateStatus === 'loading') return;
    const body = {
      companyGroupName: values.name,
      phone: values.phoneNumber,
      email: values.email,
      isRoundTrip: values.roundTrip?.toLowerCase() === 'yes',
      wheelchairLiftRequired: values.isWheelchairLift?.toLowerCase() === 'yes',
      pickupLocation: values.nameOfLocaton,
      additionalDestinations: values.additionalDestination ? [values.additionalDestination] : [],
      specialInstructions: values.specialInstructions,
    };
    console.log('[EditRFQ] Submitting PATCH /retailer/rfq?id=' + requestId);
    console.log('[EditRFQ] Request body:', body);
    try {
      const result = await dispatch(updateRetailRFQ({
        id: requestId,
        data: body,
      })).unwrap();
      console.log('[EditRFQ] Success:', result);
      navigation.goBack();
    } catch (e) {
      console.log('[EditRFQ] Error:', e);
    }
  };

  return (
    <AppLayout
      statusbackgroundColor={AppColors.red}
      style={{backgroundColor: AppColors.profileBg}}>
      <AppHeader
        role="Driver"
        title="Edit Details"
        enableBack={true}
        rightIcon={true}
      />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: hp(10),
          paddingTop: hp(2),
        }}
        showsVerticalScrollIndicator={false}>
        <View style={{paddingHorizontal: hp(2)}}>
          <View style={[AppStyles.rowBetween]}>
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>
              Company/Group Name
            </Text>
            <Controller
              name="name"
              control={control}
              rules={{required: 'Name is required'}}
              render={({field: {onChange, value}}) => (
                <AppInput
                  placeholder="Jonney Barbo"
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
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>
              Phone Number
            </Text>
            <Controller
              name="phoneNumber"
              control={control}
              rules={{required: 'Phone Number is required'}}
              render={({field: {onChange, value}}) => (
                <AppInput
                  placeholder="012 022 1531"
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
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>
              Email Address
            </Text>
            <Controller
              name="email"
              control={control}
              rules={{required: 'Email is required'}}
              render={({field: {onChange, value}}) => (
                <AppInput
                  placeholder="ab@gmail.com"
                  value={value}
                  containerStyle={[AppStyles.halfWidth]}
                  container={[styles.inputContainer, {height: 40}]}
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
              Round Trip
            </Text>
            <Controller
              name="roundTrip"
              control={control}
              render={({field: {onChange, value}}) => (
                <AppInput
                  placeholder="Shuttle"
                  value={value}
                  containerStyle={AppStyles.halfWidth}
                  container={[styles.inputContainer, {height: 40}]}
                  inputStyle={styles.inputStyle}
                  onChangeText={text => onChange(text)}
                />
              )}
            />
          </View>
          <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>
              Is a Wheelchair lift required?
            </Text>
            <Controller
              name="isWheelchairLift"
              control={control}
              render={({field: {onChange, value}}) => (
                <AppInput
                  placeholder="Yes"
                  value={value}
                  containerStyle={[AppStyles.halfWidth]}
                  container={[styles.inputContainer, {height: 40}]}
                  inputStyle={styles.inputStyle}
                  multiline={true}
                  onChangeText={text => onChange(text)}
                />
              )}
            />
          </View>
          <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>
              Name of Locaton
            </Text>
            <Controller
              name="nameOfLocaton"
              control={control}
              render={({field: {onChange, value}}) => (
                <AppInput
                  placeholder="Oakwood Elementary School"
                  value={value}
                  containerStyle={[AppStyles.halfWidth]}
                  container={styles.inputContainer}
                  inputStyle={styles.inputStyle}
                  multiline={true}
                  onChangeText={text => onChange(text)}
                />
              )}
            />
          </View>
          <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>
              Additional Destination
            </Text>
            <Controller
              name="additionalDestination"
              control={control}
              render={({field: {onChange, value}}) => (
                <AppInput
                  placeholder="Oakwood Elementary School"
                  value={value}
                  containerStyle={[AppStyles.halfWidth]}
                  container={styles.inputContainer}
                  inputStyle={styles.inputStyle}
                  multiline={true}
                  onChangeText={text => onChange(text)}
                />
              )}
            />
          </View>
          <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>
              Special Instructions
            </Text>
            <Controller
              name="specialInstructions"
              control={control}
              render={({field: {onChange, value}}) => (
                <AppInput
                  placeholder="Oakwood Elementary School"
                  value={value}
                  containerStyle={[AppStyles.halfWidth]}
                  container={styles.inputContainer}
                  inputStyle={styles.inputStyle}
                  multiline={true}
                  onChangeText={text => onChange(text)}
                />
              )}
            />
          </View>
        </View>
        <View style={{width: '90%', alignSelf: 'center'}}>
          <AppButton
            title={rfqUpdateStatus === 'loading' ? 'Updating...' : 'Update'}
            style={{width: '100%', alignSelf: 'center'}}
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      </ScrollView>
    </AppLayout>
  );
};

export default EditRetailDetail;

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
  inputStyle: {color: AppColors.black},
});
