import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {ScrollView, StyleSheet, Text, View, Platform} from 'react-native';
import {SelectList} from 'react-native-dropdown-select-list';
import AppButton from '../../components/AppButton';
import AppHeader from '../../components/AppHeader';
import AppInput from '../../components/AppInput';
import AppLayout from '../../layout/AppLayout';
import AppStyles from '../../styles/AppStyles';
import {UpdateGuardianProfileProps} from '../../types/types';
import {updateGuardianDropdown} from '../../utils/DummyData';
import AppFonts from '../../utils/appFonts';
import {AppColors} from '../../utils/color';
import {hp} from '../../utils/constants';
import {size} from '../../utils/responsiveFonts';
import {useAppSelector, useAppDispatch} from '../../store/hooks';
import {fetchParentContacts} from '../../store/user/userSlices';
import {showErrorToast, showSuccessToast} from '../../utils/toast';

const UpdateGuardianProfile: React.FC<UpdateGuardianProfileProps> = ({
  route,
}) => {
  const route_data = route?.params;
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const selectedChild = useAppSelector(state => state.userSlices.selectedChild);
  const token = useAppSelector((state: any) => state.userSlices.token);
  const loggedInUserId = useAppSelector((state: any) => state.userSlices.userId);
  const parentStudents = useAppSelector(state => state.userSlices.parentStudents);
  const [isLoading, setIsLoading] = useState(true);
  const [contactData, setContactData] = useState<any>(null);

  const getApiBaseUrl = () => {
    const manualHost = 'http://192.168.18.36:3000';
    const deviceHost =
      Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
    return manualHost?.trim() || deviceHost;
  };

  // Determine if this is Contact 1 or Contact 2
  const isContact1 = route_data?.title === 'Contact 1';
  const isContact2 = route_data?.title === 'Contact 2';

  useEffect(() => {
    const loadContactData = async () => {
      const studentId =
        selectedChild?.StudentId ||
        selectedChild?.studentId ||
        selectedChild?.id ||
        null;

      if (!studentId) {
        showErrorToast('Error', 'No student selected');
        setIsLoading(false);
        return;
      }

      if (!token) {
        showErrorToast('Error', 'Not authenticated');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const baseUrl = getApiBaseUrl();
        const query = new URLSearchParams({
          studentId: String(studentId),
        });
        
        const response = await fetch(`${baseUrl}/parent/contacts?${query}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          showErrorToast('Error', errorText || `Failed to fetch contacts`);
          setIsLoading(false);
          return;
        }

        const data = await response.json().catch(() => null);
        let contacts = [];
        
        if (data?.ok === true && Array.isArray(data?.data)) {
          contacts = data.data;
        } else if (Array.isArray(data)) {
          contacts = data;
        }

        // Filter contact based on Contact 1 or Contact 2
        console.log('All contacts:', contacts);
        console.log('isContact1:', isContact1, 'isContact2:', isContact2);
        
        let contact = null;
        if (isContact1) {
          // Contact 1: Guardian1 or IsPrimary: true
          contact = contacts.find(
            (c: any) =>
              c.Relationship === 'Guardian1' ||
              c.Relationship === 'guardian1' ||
              c.IsPrimary === true
          );
          console.log('Contact 1 found:', contact);
        } else if (isContact2) {
          // Contact 2: Guardian2 (priority) or IsPrimary: false (but not Guardian1)
          // First try to find Guardian2
          contact = contacts.find(
            (c: any) =>
              c.Relationship === 'Guardian2' || c.Relationship === 'guardian2'
          );
          
          // If Guardian2 not found, find non-primary contact that's not Guardian1
          if (!contact) {
            contact = contacts.find(
              (c: any) =>
                c.IsPrimary === false &&
                c.Relationship !== 'Guardian1' &&
                c.Relationship !== 'guardian1'
            );
          }
          
          console.log('Contact 2 found:', contact);
          if (contact) {
            console.log('Contact 2 ParentId:', contact.ParentId || contact.parentId);
          }
        }
        
        if (!contact && contacts.length > 0) {
          // Fallback: if no match found, use index-based selection
          if (isContact1) {
            contact = contacts[0]; // First contact as Contact 1
            console.log('Fallback: Using first contact as Contact 1:', contact);
          } else if (isContact2 && contacts.length > 1) {
            contact = contacts[1]; // Second contact as Contact 2
            console.log('Fallback: Using second contact as Contact 2:', contact);
          }
        }

        if (contact) {
          setContactData(contact);
          // Populate form fields
          setValue('name', contact.name || '');
          setValue('phone', contact.phone || '');
          setValue('address', contact.Address || contact.address || '');
          
          // For now, set city to Address if it's a simple string
          // You can enhance this later if Address format changes
          setValue('city', contact.Address || contact.address || '');
          setValue('state', ''); // Will be updated when API provides this
          setValue('zipCode', ''); // Will be updated when API provides this
          
          // Set relationship - use API value directly if it exists in dropdown
          const apiRelationship = contact.Relationship || contact.relationship || '';
          let dropdownValue = '';
          
          // Check if API relationship exists in dropdown data
          const foundInDropdown = updateGuardianDropdown.find(
            item => item.value.toLowerCase() === apiRelationship.toLowerCase()
          );
          
          if (foundInDropdown) {
            // Use exact match from dropdown
            dropdownValue = foundInDropdown.value;
          } else {
            // Fallback mapping for common variations
            if (apiRelationship.toLowerCase().includes('guardian1')) {
              dropdownValue = 'Guardian1';
            } else if (apiRelationship.toLowerCase().includes('guardian2')) {
              dropdownValue = 'Guardian2';
            } else if (apiRelationship.toLowerCase().includes('guardian')) {
              dropdownValue = 'Guardian';
            } else if (apiRelationship.toLowerCase().includes('parent')) {
              dropdownValue = 'Parent';
            } else if (apiRelationship.toLowerCase().includes('relative')) {
              dropdownValue = 'Relative';
            } else if (apiRelationship.toLowerCase().includes('family friend')) {
              dropdownValue = 'Family Friend';
            } else if (apiRelationship.toLowerCase().includes('other')) {
              dropdownValue = 'Other';
            } else {
              // Use API value as is if no match found
              dropdownValue = apiRelationship;
            }
          }
          
          setValue('relationWithChild', dropdownValue);
          setValue('email', contact.email || '');
          
          console.log('Loaded contact data:', contact);
          console.log('API Relationship:', apiRelationship, '→ Dropdown Value:', dropdownValue);
        } else {
          // No contact found, show message
          console.warn(`No ${route_data?.title || 'contact'} found for this student`);
          // Keep form empty if no contact found
        }
      } catch (err: any) {
        console.warn('Error loading contact data:', err);
        showErrorToast('Error', 'Failed to load contact data');
      } finally {
        setIsLoading(false);
      }
    };

    loadContactData();
  }, [selectedChild, token, isContact1, isContact2, route_data?.title]);

  const {
    control,
    handleSubmit,
    setValue,
    formState: {errors},
  } = useForm({
    defaultValues: {
      name: '',
      relationWithChild: '',
      otherRelation:'',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: '',
    },
  });

  const onSubmit = async (formValues: any) => {
    if (!contactData) {
      showErrorToast('Error', 'No contact data available');
      return;
    }

    // Backend checks if contact belongs to logged-in user
    // Use ParentId from contact data for the API endpoint
    const parentId = contactData.ParentId || contactData.parentId;
    const contactUserId = contactData.UserId || contactData.userId;
    
    console.log('Contact Data:', contactData);
    console.log('Logged-in UserId:', loggedInUserId);
    console.log('Contact UserId:', contactUserId);
    console.log('Contact ParentId:', parentId);
    console.log('Contact Type:', isContact1 ? 'Contact 1' : isContact2 ? 'Contact 2' : 'Unknown');
    
    // Backend validates that contact belongs to logged-in user
    // The endpoint uses ParentId, but backend checks ownership via logged-in user's token
    if (!parentId) {
      showErrorToast('Error', 'Parent ID not found in contact data');
      console.error('ParentId is missing in contactData:', contactData);
      return;
    }
    
    if (!loggedInUserId) {
      showErrorToast('Error', 'User ID not found. Please login again.');
      console.error('Logged-in UserId is missing');
      return;
    }

    if (!token) {
      showErrorToast('Error', 'Not authenticated');
      return;
    }

    const baseUrl = getApiBaseUrl();
    
    // Prepare payload - use camelCase as per API requirement
    const payload = {
      name: formValues.name || '',
      relationship: formValues.relationWithChild || formValues.otherRelation || '',
      address: formValues.address || '',
      city: formValues.city || '',
      state: formValues.state || '',
      zipCode: formValues.zipCode || '',
      phone: formValues.phone || '',
      email: formValues.email || '', // Add email if you have it in form
    };

    // If "Other" is selected, use otherRelation value
    if (formValues.relationWithChild === 'Other' && formValues.otherRelation) {
      payload.relationship = formValues.otherRelation;
    }

    console.log('Update Contact Payload:', JSON.stringify(payload, null, 2));
    console.log('Using ParentId for endpoint:', parentId);
    console.log('Logged-in UserId:', loggedInUserId);
    console.log('Contact UserId:', contactUserId);

    try {
      // Use ParentId from contact data for the endpoint
      // Backend will verify that this contact belongs to logged-in user
      const response = await fetch(`${baseUrl}/parent/contacts/${parentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Update Contact Response Status:', response.status);

      if (!response.ok) {
        let errorMsg = `Status ${response.status}`;
        try {
          const errorBody = await response.json();
          console.log('Error response body:', errorBody);
          if (errorBody?.message) {
            errorMsg = Array.isArray(errorBody.message)
              ? errorBody.message.join(', ')
              : errorBody.message;
          } else if (errorBody?.error) {
            errorMsg = errorBody.error;
          } else if (typeof errorBody === 'string') {
            errorMsg = errorBody;
          }
        } catch (e) {
          const text = await response.text().catch(() => '');
          console.log('Error response text:', text);
          if (text) errorMsg = text;
        }

        showErrorToast('Update failed', errorMsg);
        return;
      }

      const responseData = await response.json().catch(() => null);
      console.log('Update Contact Success Response:', responseData);

      showSuccessToast('Updated', 'Contact updated successfully');
      
      // Refresh contacts data by reloading
      // You can also dispatch fetchParentContacts here if needed
      
      navigation.goBack();
    } catch (err: any) {
      console.warn('Update contact error:', err);
      showErrorToast('Update failed', err?.message || 'Network error');
    }
  };

  return (
    <AppLayout>
      <AppHeader
        title={route_data?.title}
        enableBack={true}
        rightIcon={false}
      />
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading contact data...</Text>
        </View>
      ) : (
      <ScrollView
        scrollEnabled={true}
        style={{flex: 1}}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          AppStyles.body,
          {
            justifyContent: 'space-between',
          },
        ]}>
        <View style={styles.container}>
          <Controller
            name="name"
            control={control}
            rules={{required: 'Name is required'}}
            render={({field: {onChange, value}}) => (
              <AppInput
                value={value}
                onChangeText={(text: string) => onChange(text)}
                containerStyle={styles.inputContainer}
                label="Name"
                editable={true}
                error={errors.name?.message}
              />
            )}
          />
          <Controller
            name="relationWithChild"
            control={control}
            rules={{required: 'Required*'}}
            render={({field: {onChange, value}}) => (
              <>
                <AppInput
                  containerStyle={{marginBottom: hp(0)}}
                  label="Relation with Child"
                  container={{display: 'none'}}
                />
                <SelectList
                  search={false}
                  setSelected={(val: string) => onChange(val)}
                  data={updateGuardianDropdown}
                  save="value"
                  placeholder="Select"
                  defaultOption={
                    value
                      ? updateGuardianDropdown.find(item => item.value === value)
                      : undefined
                  }
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
                {errors.relationWithChild?.message && (
                  <Text style={styles.errorText}>
                    {errors.relationWithChild.message}
                  </Text>
                )}

                {/* Show input field if "Other" is selected */}
                {value === 'Other' && (
                  <Controller
                    name="otherRelation"
                    control={control}
                    rules={{required: 'Please specify your relationship'}}
                    render={({field: {onChange, value}}) => (
                      <AppInput
                        containerStyle={styles.inputContainerStyle}
                        label="Specify Relationship"
                        value={value}
                        onChangeText={onChange}
                        inputStyle={{color: AppColors.black}}
                        error={errors.otherRelation?.message}
                      />
                    )}
                  />
                )}
              </>
            )}
          />

          <Controller
            name="address"
            control={control}
            rules={{required: 'Address is required'}}
            render={({field: {onChange, value}}) => (
              <AppInput
                value={value}
                onChangeText={(text: string) => onChange(text)}
                containerStyle={[styles.inputContainer, {marginTop: hp(1.6)}]}
                label="Address"
                editable={true}
                error={errors.address?.message}
              />
            )}
          />
          <Controller
            name="city"
            control={control}
            rules={{required: 'City is required'}}
            render={({field: {onChange, value}}) => (
              <AppInput
                containerStyle={styles.inputContainer}
                label="City"
                value={value}
                onChangeText={(text: string) => onChange(text)}
                editable={true}
                error={errors.city?.message}
              />
            )}
          />
          <Controller
            name="state"
            control={control}
            rules={{required: 'State is required'}}
            render={({field: {onChange, value}}) => (
              <AppInput
                containerStyle={styles.inputContainer}
                label="State"
                value={value}
                onChangeText={(text: string) => onChange(text)}
                editable={true}
                error={errors.state?.message}
              />
            )}
          />
          <Controller
            name="zipCode"
            control={control}
            rules={{required: 'Zip Code is required'}}
            render={({field: {onChange, value}}) => (
              <AppInput
                containerStyle={styles.inputContainer}
                label="Zip Code"
                value={value}
                onChangeText={(text: string) => onChange(text)}
                editable={true}
                error={errors.zipCode?.message}
              />
            )}
          />
          <Controller
            name="phone"
            control={control}
            rules={{
              required: 'Phone is required',
              pattern: {
                value: /^[0-9]{11}$/,
                message: 'Phone number must be 11 digits',
              },
            }}
            render={({field: {onChange, value}}) => (
              <AppInput
                containerStyle={styles.inputContainer}
                label="Phone"
                value={value}
                onChangeText={(text: string) => {
                  const numericText = text.replace(/[^0-9]/g, '');
                  onChange(numericText);
                }}
                editable={true}
                keyboardType="number-pad"
                maxLength={11}
                error={errors.phone?.message}
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            rules={{
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            }}
            render={({field: {onChange, value}}) => (
              <AppInput
                containerStyle={styles.inputContainer}
                label="Email (Optional)"
                value={value}
                onChangeText={(text: string) => onChange(text)}
                editable={true}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email?.message}
              />
            )}
          />
        </View>

        <AppButton
          onPress={handleSubmit(onSubmit)}
          title="Update"
          style={styles.button}
          loading={isLoading}
          disabled={isLoading}
        />
      </ScrollView>
      )}
    </AppLayout>
  );
};

export default UpdateGuardianProfile;

const styles = StyleSheet.create({
  container: {marginTop: hp(3)},
  inputContainer: {
    marginBottom: hp(1.6),
  },
  button: {
    alignSelf: 'center',
    width: '100%',
    backgroundColor: AppColors.black,
    marginTop: hp(4),
    marginBottom: hp(8),
  },
  boxStyle: {
    backgroundColor: AppColors.white,
    alignItems: 'center',
    borderColor: AppColors.black,
  },
  errorText: {
    color: AppColors.red,
    fontSize: size.sl,
    fontFamily: AppFonts.NunitoSansRegular,
    marginTop: hp(0.5),
    marginLeft: hp(0.5),
  },
  inputContainerStyle:{
    marginTop:hp(2)
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp(10),
  },
  loadingText: {
    fontSize: size.md,
    fontFamily: AppFonts.NunitoSansSemiBold,
    color: AppColors.black,
  },
});
