import {useNavigation} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {Image, ScrollView, StyleSheet, View} from 'react-native';
import {SelectList} from 'react-native-dropdown-select-list';
import AppButton from '../../components/AppButton';
import AppHeader from '../../components/AppHeader';
import AppInput from '../../components/AppInput';
import GlobalIcon from '../../components/GlobalIcon';
import AppLayout from '../../layout/AppLayout';
import AppFonts from '../../utils/appFonts';
import {AppColors} from '../../utils/color';
import {hp} from '../../utils/constants';
import {size} from '../../utils/responsiveFonts';

export default function ChildProfile() {
  const navigation = useNavigation();

  const data = [
    {key: '1', value: 'Bus'},
    {key: '2', value: 'Bike'},
    {key: '3', value: 'Car'},
    {key: '4', value: 'Auto'},
  ];

  useEffect(() => {
    setValue('firstName', 'Jacob');
    setValue('lastName', 'Jones');
    setValue('emergencyContactName', 'Tanner');
    setValue('emergencyContact', '+93123132325');
  }, []);

  const {
    control,
    handleSubmit,
    setValue,
    formState: {errors},
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      emergencyContactName: '',
      emergencyContact: '',
      medicalDetails: '',
      note: '',
      transportationPreference: '',
    },
  });

  const onSubmit = () => {
    navigation.goBack();
  };

  return (
    <AppLayout>
      <AppHeader title="Child Profile" enableBack={true} rightIcon={false} />
      <ScrollView
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: hp(2),
          backgroundColor: AppColors.screenColor,
          justifyContent: 'space-between',
        }}>
        <View style={{paddingTop: hp(3)}}>
          {/* <View style={{position: 'relative'}}>
            <View style={styles.imageContainer}>
              <Image
                style={styles.image}
                source={require('../../assets/images/profile_image.webp')}
              />
            </View>
            <View style={styles.cameraIcon}>
              <View style={{marginTop: hp(0.5)}}>
                <GlobalIcon
                  library="FontelloIcon"
                  name="group-183"
                  color={AppColors.black}
                  size={hp(2.5)}
                />
              </View>
            </View>
          </View> */}

          <Controller
            name="firstName"
            control={control}
            rules={{required: 'First Name is required'}}
            render={({field: {onChange, value}}) => (
              <AppInput
                containerStyle={styles.inputContainerStyle}
                label="First Name"
                value={value}
                onChangeText={(text: string) => onChange(text)}
                inputStyle={{color: AppColors.black}}
                editable={true}
                error={errors.firstName?.message}
              />
            )}
          />
          <Controller
            name="lastName"
            control={control}
            rules={{required: 'Last Name is required'}}
            render={({field: {onChange, value}}) => (
              <AppInput
                containerStyle={styles.inputContainerStyle}
                label="Last Name"
                value={value}
                onChangeText={(text: string) => onChange(text)}
                inputStyle={{color: AppColors.black}}
                editable={true}
                error={errors.lastName?.message}
              />
            )}
          />
          <Controller
            name="emergencyContactName"
            control={control}
            rules={{required: 'Emergency Contacts Name is required'}}
            render={({field: {onChange, value}}) => (
              <AppInput
                containerStyle={styles.inputContainerStyle}
                label="Emergency Contacts Name"
                value={value}
                onChangeText={(text: string) => onChange(text)}
                inputStyle={{color: AppColors.black}}
                editable={true}
                error={errors.emergencyContactName?.message}
              />
            )}
          />
          <Controller
            name="emergencyContact"
            control={control}
            rules={{required: 'Emergency Contact is required'}}
            render={({field: {onChange, value}}) => (
              <AppInput
                containerStyle={styles.inputContainerStyle}
                label="Emergency Contacts No"
                value={value}
                onChangeText={(text: string) => onChange(text)}
                inputStyle={{color: AppColors.black}}
                editable={true}
                keyboardType="number-pad"
                error={errors.emergencyContact?.message}
              />
            )}
          />
          <Controller
            name="medicalDetails"
            control={control}
            rules={{required: 'Medical Details is required'}}
            render={({field: {onChange, value}}) => (
              <AppInput
                containerStyle={styles.inputContainerStyle}
                multiline
                numberOfLines={7}
                value={value}
                container={{height: hp(16)}}
                label="Medical Details (Optional)"
                placeholder="Descripton"
                onChangeText={(text: string) => onChange(text)}
                inputStyle={{color: AppColors.black}}
                editable={true}
                error={errors.medicalDetails?.message}
              />
            )}
          />
          <Controller
            name="note"
            control={control}
            rules={{required: 'Note is required'}}
            render={({field: {onChange, value}}) => (
              <AppInput
                containerStyle={styles.inputContainerStyle}
                multiline
                numberOfLines={7}
                container={{height: hp(16)}}
                label="Note (Optional)"
                placeholder="Description"
                value={value}
                onChangeText={(text) => onChange(text)}
                error={errors.note?.message}
              />
            )}
          />
          <Controller
            name="transportationPreference"
            control={control}
            // rules={{required: 'Transportation Preference is required'}}
            render={({field: {onChange, value}}) => (
              <>
                <AppInput
                  containerStyle={{marginBottom: 0}}
                  label="Transportation Preference"
                  container={{display: 'none'}}
                />
                <SelectList
                  search={false}
                  setSelected={(val: string) => onChange(val)}
                  data={data}
                  save="value"
                  placeholder="Select"
                  boxStyles={styles.boxStyle}
                  dropdownStyles={{
                    backgroundColor: AppColors.white,
                    borderColor: AppColors.black,
                  }}
                  dropdownTextStyles={{
                    color: AppColors.black,
                    fontSize: size.sl,
                    fontFamily: AppFonts.NunitoSansSemiBold,
                  }}
                  inputStyles={{
                    fontSize: size.sl,
                    color: AppColors.black,
                    fontFamily: AppFonts.NunitoSansSemiBold,
                  }}
                />
              </>
            )}
          />
        </View>

        <AppButton
          onPress={handleSubmit(onSubmit)}
          title="Update"
          style={styles.button}
        />
      </ScrollView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: AppColors.inputColor,
    padding: hp(1.5),
    borderRadius: hp(1.5),
    marginVertical: hp(1),
  },
  imageContainer: {
    height: hp(18),
    width: hp(18),
    borderRadius: hp(20),
    alignSelf: 'center',
    marginVertical: hp(4),
  },
  image: {
    height: '100%',
    width: '100%',
    borderRadius: hp(16),
  },
  cameraIcon: {
    height: hp(5),
    width: hp(5),
    borderWidth: 1,
    borderRadius: hp(10),
    position: 'absolute',
    top: 125,
    right: 112,
    backgroundColor: AppColors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainerStyle: {marginBottom: hp(1.4)},
  boxStyle: {
    // marginBottom: hp(3),
    backgroundColor: AppColors.white,
    height: hp(7),
    alignItems: 'center',
    borderColor: AppColors.black,
  },
  button: {
    alignSelf: 'center',
    width: '100%',
    backgroundColor: AppColors.black,
    marginTop: hp(4),
    marginBottom: hp(5),
  },
});
