import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
  PermissionsAndroid,
  Platform,
  Pressable,
  Alert,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
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
import {useAppSelector, useAppDispatch} from '../../store/hooks';
import {setSelectedChild, fetchParentStudents} from '../../store/user/userSlices';
import {showSuccessToast, showErrorToast} from '../../utils/toast';

export default function ChildProfile() {
  const navigation = useNavigation();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const selectedChild = useAppSelector(state => state.userSlices.selectedChild);
  const token = useAppSelector((state: any) => state.userSlices.token);
  const parentId = useAppSelector((state: any) => state.userSlices.userId);

  const data = [
    {key: '1', value: 'Bus'},
    {key: '2', value: 'Bike'},
    {key: '3', value: 'Car'},
    {key: '4', value: 'Auto'},
  ];

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

  useEffect(() => {
    // Get the first and last name from selectedChild
    console.log('ChildProfile selectedChild:', selectedChild);
    
    const firstName =
      selectedChild?.firstName ||
      selectedChild?.FirstName ||
      selectedChild?.studentName?.split(' ')[0] ||
      selectedChild?.StudentName?.split(' ')[0] ||
      selectedChild?.title?.split(' ')[0] ||
      '';
    
    const lastName =
      selectedChild?.lastName ||
      selectedChild?.LastName ||
      (selectedChild?.studentName?.split(' ').slice(1).join(' ') ||
        selectedChild?.StudentName?.split(' ').slice(1).join(' ') ||
        selectedChild?.title?.split(' ').slice(1).join(' ') ||
        '');

    // Emergency contact name from ParentName
    const emergencyContactName = selectedChild?.ParentName || selectedChild?.parentName || '';
    
    // Emergency contact phone from ContactPhone
    const emergencyContact = selectedChild?.ContactPhone || selectedChild?.contactPhone || selectedChild?.ParentContactPhone || '';
    
    // Medical details
    const medicalDetails = selectedChild?.MedicalDetails || selectedChild?.medicalDetails || '';
    
    // Notes
    const note = selectedChild?.Notes || selectedChild?.notes || '';

    console.log('Mapped values:', {firstName, lastName, emergencyContactName, emergencyContact, medicalDetails, note});

    setValue('firstName', firstName);
    setValue('lastName', lastName);
    setValue('emergencyContactName', emergencyContactName);
    setValue('emergencyContact', emergencyContact);
    setValue('medicalDetails', medicalDetails);
    setValue('note', note);
  }, [selectedChild, setValue]);

  const requestGalleryPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            {
              title: 'Gallery Permission',
              message: 'App needs access to your gallery.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission',
              message: 'App needs access to your storage.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      }
      return true; // iOS handled automatically
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const openGallery = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Cannot open gallery without permission',
      );
      return;
    }

    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 300,
        maxHeight: 300,
        quality: 0.8,
      },
      response => {
        console.log('Image Picker Response: ', response);

        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('Image Picker Error: ', response.errorMessage);
        } else {
          const source = response.assets?.[0]?.uri;
          if (source) {
            setProfileImage(source);
          }
        }
      },
    );
  };

  const dispatch = useAppDispatch();

  const getApiBaseUrl = () => {
    const manualHost = 'http://192.168.18.36:3000';
    const deviceHost =
      Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
    return manualHost?.trim() || deviceHost;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (formValues: any) => {
    const studentId =
      selectedChild?.StudentId || selectedChild?.studentId || selectedChild?.id || null;

    if (!token) {
      showErrorToast('Not authenticated', 'Please login again');
      return;
    }
    if (!studentId) {
      showErrorToast('Missing student', 'No student selected');
      return;
    }

    const payload = {
      studentId: Number(studentId),
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      guardian1: formValues.emergencyContactName,
      medicalDetails: formValues.medicalDetails || null,
      notes: formValues.note || null,
      contactPhone: formValues.emergencyContact || null,
    };

    console.log('ChildProfile Update Payload:', JSON.stringify(payload, null, 2));

    const baseUrl = getApiBaseUrl();
    let attempts = 0;
    const maxAttempts = 3;
    let lastError: any = null;
    setIsSubmitting(true);
    try {
      while (attempts < maxAttempts) {
        attempts += 1;
        try {
          console.log(`Attempt ${attempts}: Calling ${baseUrl}/parent/update-student`);
          
          const res = await fetch(`${baseUrl}/parent/update-student`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
            body: JSON.stringify(payload),
          });

          console.log('Response status:', res.status, res.statusText);

          if (!res.ok) {
            // try parse error
            let errMsg = `Status ${res.status}`;
            try {
              const errBody = await res.json();
              console.log('Error response body:', errBody);
              if (errBody?.message) errMsg = errBody.message;
              else if (typeof errBody === 'string') errMsg = errBody;
              else if (errBody?.error) errMsg = errBody.error;
            } catch (e) {
              const text = await res.text().catch(() => '');
              console.log('Error response text:', text);
              if (text) errMsg = text;
            }

            lastError = errMsg;
            if (res.status >= 500 && attempts < maxAttempts) {
              await new Promise(r => setTimeout(r, 500 * attempts));
              continue;
            }

            showErrorToast('Update failed', errMsg);
            return;
          }

          const responseText = await res.text();
          console.log('Response text:', responseText);
          
          let data = null;
          try {
            data = JSON.parse(responseText);
          } catch (e) {
            console.warn('Failed to parse JSON response:', e);
            // Try to handle non-JSON response
            if (responseText.trim()) {
              data = responseText;
            }
          }

          console.log('Parsed response data:', data);

          // Handle different response formats
          let updated = null;
          if (data) {
            // Check if response has data property
            if (data?.data) {
              updated = Array.isArray(data.data) ? data.data[0] : data.data;
            }
            // Check if response is wrapped in ok/data structure
            else if (data?.ok === true && data?.data) {
              updated = Array.isArray(data.data) ? data.data[0] : data.data;
            }
            // Check if response is directly the student object
            else if (data?.StudentId || data?.studentId || data?.id) {
              updated = data;
            }
            // Check if response is an array
            else if (Array.isArray(data)) {
              updated = data[0] || data;
            }
            // Fallback to data itself
            else {
              updated = data;
            }
          }

          console.log('Updated student data:', updated);

          if (updated) {
            // Merge updated data with existing selectedChild to preserve other fields
            // Handle both camelCase (from API) and PascalCase (from existing state)
            const mergedData = {
              ...selectedChild,
              ...updated,
              // Map camelCase to PascalCase for consistency with existing state
              StudentId: updated.studentId || updated.StudentId || Number(studentId),
              studentId: updated.studentId || updated.StudentId || Number(studentId),
              FirstName: updated.firstName || updated.FirstName || formValues.firstName,
              firstName: updated.firstName || updated.FirstName || formValues.firstName,
              LastName: updated.lastName || updated.LastName || formValues.lastName,
              lastName: updated.lastName || updated.LastName || formValues.lastName,
              ParentName: updated.parentName || updated.ParentName || formValues.emergencyContactName,
              parentName: updated.parentName || updated.ParentName || formValues.emergencyContactName,
              Guardian1: updated.guardian1 || updated.Guardian1 || formValues.emergencyContactName,
              guardian1: updated.guardian1 || updated.Guardian1 || formValues.emergencyContactName,
              ContactPhone: updated.contactPhone || updated.ContactPhone || formValues.emergencyContact,
              contactPhone: updated.contactPhone || updated.ContactPhone || formValues.emergencyContact,
              MedicalDetails: updated.medicalDetails || updated.MedicalDetails || formValues.medicalDetails,
              medicalDetails: updated.medicalDetails || updated.MedicalDetails || formValues.medicalDetails,
              Notes: updated.notes || updated.Notes || formValues.note,
              notes: updated.notes || updated.Notes || formValues.note,
            };
            
            console.log('Merged data to dispatch:', mergedData);
            
            // Update selected child in Redux immediately
            dispatch(setSelectedChild(mergedData));
            
            // Refresh parent students list to update dropdown on home screen
            // This will ensure the dropdown shows updated data
            dispatch(fetchParentStudents());
            
            showSuccessToast('Updated', 'Student profile updated successfully');
            navigation.goBack();
            return;
          } else {
            console.warn('No updated data received from API');
            showErrorToast('Update failed', 'No data returned from server');
            return;
          }
        } catch (err: any) {
          console.warn('Fetch error:', err);
          lastError = err;
          if (attempts < maxAttempts) {
            await new Promise(r => setTimeout(r, 500 * attempts));
            continue;
          }
          throw err;
        }
      }
    } catch (err: any) {
      console.warn('update student error', err);
      showErrorToast('Update failed', (lastError && (lastError.message || String(lastError))) || 'Network error');
    } finally {
      setIsSubmitting(false);
    }
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
          <View style={{position: 'relative'}}>
            <Pressable onPress={openGallery}>
              <View style={styles.imageContainer}>
                <Image
                  style={styles.image}
                  source={
                    profileImage
                      ? {uri: profileImage}
                      : require('../../assets/images/profile_image.webp')
                  }
                />
              </View>
            </Pressable>
            <View style={styles.cameraIcon}>
              <GlobalIcon
                library="FontelloIcon"
                name="group-183"
                color={AppColors.black}
                size={hp(2.5)}
                onPress={openGallery}
              />
            </View>
          </View>

          {/* All your inputs (no changes needed) */}
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
            rules={{
              required: 'Emergency Contact is required',
              minLength: {value: 7, message: 'Phone must be at least 7 characters'},
              maxLength: {value: 20, message: 'Phone must be 20 characters or fewer'},
              pattern: {
                value: /^[0-9+\s()\-]*$/,
                message: 'Invalid phone format',
              },
            }}
            render={({field: {onChange, value}}) => (
              <AppInput
                containerStyle={styles.inputContainerStyle}
                label="Emergency Contacts No"
                value={value}
                onChangeText={(text: string) => {
                  // Allow only digits, +, space, parentheses and hyphen; limit length
                  const filtered = text.replace(/[^0-9+\s()\-]/g, '').slice(0, 20);
                  onChange(filtered);
                }}
                inputStyle={{color: AppColors.black}}
                editable={true}
                keyboardType="phone-pad"
                error={errors.emergencyContact?.message}
              />
            )}
          />
          <Controller
            name="medicalDetails"
            control={control}
            render={({field: {onChange, value}}) => (
              <AppInput
                containerStyle={styles.inputContainerStyle}
                multiline
                numberOfLines={7}
                value={value}
                container={{height: hp(16)}}
                label="Medical Details (Optional)"
                placeholder="Description"
                onChangeText={(text: string) => onChange(text)}
                inputStyle={{color: AppColors.black}}
                editable={true}
              />
            )}
          />
          <Controller
            name="note"
            control={control}
            render={({field: {onChange, value}}) => (
              <AppInput
                containerStyle={styles.inputContainerStyle}
                multiline
                numberOfLines={7}
                container={{height: hp(16)}}
                label="Note (Optional)"
                placeholder="Description"
                value={value}
                onChangeText={text => onChange(text)}
              />
            )}
          />
          {/* <Controller
            name="transportationPreference"
            control={control}
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
          /> */}
        </View>

        <AppButton
          onPress={handleSubmit(onSubmit)}
          title="Update"
          style={styles.button}
          loading={isSubmitting}
          disabled={isSubmitting}
        />
      </ScrollView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    height: hp(18),
    width: hp(18),
    borderRadius: hp(20),
    alignSelf: 'center',
    marginVertical: hp(4),
    overflow: 'hidden',
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
