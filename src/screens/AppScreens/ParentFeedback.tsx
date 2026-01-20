import React, {useState} from 'react';
import {ScrollView, StyleSheet, Text, View, Platform} from 'react-native';
import AppButton from '../../components/AppButton';
import AppHeader from '../../components/AppHeader';
import AppInput from '../../components/AppInput';
import AppLayout from '../../layout/AppLayout';
import AppStyles from '../../styles/AppStyles';
import {AppColors} from '../../utils/color';
import {hp} from '../../utils/constants';
import AppModal from '../../components/AppModal';
import {useNavigation} from '@react-navigation/native';
import AppCheckBox from '../../components/AppCheckBox';
import {size} from '../../utils/responsiveFonts';
import AppFonts from '../../utils/appFonts';
import {Controller, useForm} from 'react-hook-form';
import CalendarPicker from '../../components/CalendarPicker';
import {useAppSelector} from '../../store/hooks';
import {showSuccessToast, showErrorToast} from '../../utils/toast';
import moment from 'moment';
import {SelectList} from 'react-native-dropdown-select-list';

const ParentFeedback = () => {
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedChild = useAppSelector(state => state.userSlices.selectedChild);
  const token = useAppSelector((state: any) => state.userSlices.token);
  const parentId = useAppSelector((state: any) => state.userSlices.userId);
  const [selectedItems, setSelectedItems] = useState<number[]>([]); // allow multiple selections

  const checkboxItems = [
    {id: 1, label: 'Driver'},
    {id: 2, label: 'School'},
    {id: 3, label: 'Bus Terminal'},
    {id: 4, label: 'All'},
  ];

  const getApiBaseUrl = () => {
    const manualHost = 'http://192.168.18.36:3000';
    const deviceHost =
      Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
    return manualHost?.trim() || deviceHost;
  };

  const feedbackTypeOptions = [
    {key: '1', value: 'Complaint'},
    {key: '2', value: 'Suggestion'},
    {key: '3', value: 'Praise'},
    {key: '4', value: 'Other'},
  ];

  const {
    control,
    handleSubmit,
    setValue,
    formState: {errors},
  } = useForm({
    defaultValues: {
      feedback: '',
      date: '',
      busNumber: '',
      driverName: '',
      feedbackType: 'Complaint',
      subject: '',
    },
  });

  const onSubmit = async (formValues: any) => {
    // Validation
    if (!formValues.date) {
      showErrorToast('Error', 'Date is required');
      return;
    }

    if (selectedItems.length === 0) {
      showErrorToast('Error', 'Please select at least one recipient (Send To)');
      return;
    }

    if (!formValues.subject || formValues.subject.trim() === '') {
      showErrorToast('Error', 'Subject is required');
      return;
    }

    if (!token) {
      showErrorToast('Error', 'Not authenticated');
      return;
    }

    if (!parentId) {
      showErrorToast('Error', 'Parent ID not found');
      return;
    }

    const studentId =
      selectedChild?.StudentId ||
      selectedChild?.studentId ||
      selectedChild?.id ||
      null;

    // Map selected checkboxes to sendTo array
    const sendTo = selectedItems.map(id => {
      const item = checkboxItems.find(cb => cb.id === id);
      return item?.label || '';
    }).filter(Boolean);

    // Format date to YYYY-MM-DD format
    let feedbackDate = '';
    if (formValues.date) {
      // If date is already in correct format, use it; otherwise format it
      if (typeof formValues.date === 'string' && formValues.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        feedbackDate = formValues.date;
      } else {
        feedbackDate = moment(formValues.date).format('YYYY-MM-DD');
      }
    }

    // Prepare payload according to API requirements
    const payload = {
      studentId: studentId || undefined, // Optional
      feedbackDate: feedbackDate,
      busNumber: formValues.busNumber || undefined, // Optional
      driverName: formValues.driverName || undefined, // Optional
      sendTo: sendTo, // Array: ["Driver", "School", "Bus Terminal", "All"]
      feedbackType: formValues.feedbackType || 'Complaint', // "Complaint", "Suggestion", "Praise", "Other"
      subject: formValues.subject, // Required field
      message: formValues.feedback,
    };

    // Remove undefined fields
    Object.keys(payload).forEach(key => {
      if (payload[key as keyof typeof payload] === undefined) {
        delete payload[key as keyof typeof payload];
      }
    });

    console.log('Parent Feedback Payload:', JSON.stringify(payload, null, 2));

    const baseUrl = getApiBaseUrl();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${baseUrl}/parent/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Feedback Response Status:', response.status);

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

        showErrorToast('Submit failed', errorMsg);
        return;
      }

      const responseData = await response.json().catch(() => null);
      console.log('Feedback Success Response:', responseData);

      showSuccessToast('Submitted', 'Feedback submitted successfully');
      setVisible(true);
      setTimeout(() => {
        setVisible(false);
        navigation.navigate('HomeSreen');
      }, 2000);
    } catch (err: any) {
      console.warn('Submit feedback error:', err);
      showErrorToast('Submit failed', err?.message || 'Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleCheckBox = (index: number) => {
  //   if (selectedCheckBox == index) {
  //     setSelectedCheckBox(null);
  //   } else {
  //     setSelectedCheckBox(index);
  //   }
  // };

  const handleCheckBox = (id: number) => {
    const allId = 4; // "All" checkbox ID
    
    if (id === allId) {
      // If "All" is clicked
      if (selectedItems.includes(allId)) {
        // If "All" is already selected, deselect it only
        setSelectedItems(selectedItems.filter(item => item !== allId));
      } else {
        // If "All" is not selected, select all checkboxes
        setSelectedItems([1, 2, 3, 4]);
      }
    } else {
      // If any other checkbox is clicked
      if (selectedItems.includes(id)) {
        // If already selected, remove it
        const newSelected = selectedItems.filter(item => item !== id);
        // If "All" was selected, remove it too
        const finalSelected = newSelected.filter(item => item !== allId);
        setSelectedItems(finalSelected);
      } else {
        // If not selected, add it
        const newSelected = [...selectedItems, id];
        // Check if all individual checkboxes (1, 2, 3) are now selected
        const individualIds = [1, 2, 3];
        const allIndividualSelected = individualIds.every(individualId => 
          newSelected.includes(individualId)
        );
        
        if (allIndividualSelected) {
          // If all individual checkboxes are selected, also select "All"
          setSelectedItems([...newSelected, allId]);
        } else {
          setSelectedItems(newSelected);
        }
      }
    }
  };

  return (
    <AppLayout>
      <AppHeader enableBack={true} title="Parent Feedback" rightIcon={false} />
      <View style={[AppStyles.container, styles.container]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View>
            <Controller
              name="date"
              control={control}
              rules={{required: 'Date is required'}}
              render={({field: {onChange, value}, fieldState: {error}}) => (
                <CalendarPicker
                  selectedDate={value}
                  setDates={(date: string) => onChange(date)}
                  error={error?.message}
                  label="Select Date"
                />
              )}
            />
            {/* <AppInput label="Select Date" placeholder="Micky Snow" /> */}

            <Controller
              name="busNumber"
              control={control}
              render={({field: {onChange, value}}) => (
                <AppInput
                  label="Bus Number (Optional)"
                  placeholder="KBA-2024"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            <Controller
              name="driverName"
              control={control}
              render={({field: {onChange, value}}) => (
                <AppInput
                  label="Driver Name"
                  placeholder="Driver Name"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            <Controller
              name="feedbackType"
              control={control}
              rules={{required: 'Feedback type is required'}}
              render={({field: {onChange, value}}) => (
                <>
                  <AppInput
                    containerStyle={{marginBottom: 0}}
                    label="Feedback Type"
                    container={{display: 'none'}}
                    labelStyle={{
                      fontFamily: AppFonts.NunitoSansBold,
                    }}
                  />
                  <SelectList
                    search={false}
                    setSelected={(val: string) => onChange(val)}
                    data={feedbackTypeOptions}
                    save="value"
                    placeholder="Select Feedback Type"
                    defaultOption={feedbackTypeOptions.find(item => item.value === value)}
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
                  {errors.feedbackType?.message && (
                    <Text style={styles.errorText}>
                      {errors.feedbackType.message}
                    </Text>
                  )}
                </>
              )}
            />
            <Controller
              name="subject"
              control={control}
              rules={{required: 'Subject is required'}}
              render={({field: {onChange, value}}) => (
                <AppInput
                  label="Subject"
                  placeholder="Bus delay issue"
                  value={value}
                  onChangeText={onChange}
                  error={errors.subject?.message}
                />
              )}
            />
            <View style={styles.sendToContainer}>
              <Text style={styles.label}>Send To</Text>
              {/* <View style={styles.checkBoxContainer}>
                <AppCheckBox
                  isChecked={selectedCheckBox == 1}
                  onClick={() => handleCheckBox(1)}
                  rightText="Driver"
                  uncheckedCheckBoxColor={AppColors.dimGray}
                />
                <AppCheckBox
                  isChecked={selectedCheckBox == 2}
                  onClick={() => handleCheckBox(2)}
                  rightText="School"
                  uncheckedCheckBoxColor={AppColors.dimGray}
                />
                <AppCheckBox
                  isChecked={selectedCheckBox == 3}
                  onClick={() => handleCheckBox(3)}
                  rightText="Bus Terminal"
                  uncheckedCheckBoxColor={AppColors.dimGray}
                />
                <AppCheckBox
                  isChecked={selectedCheckBox == 4}
                  onClick={() => handleCheckBox(4)}
                  rightText="All"
                  uncheckedCheckBoxColor={AppColors.dimGray}
                />
              </View> */}
              <View style={styles.checkBoxContainer}>
                {checkboxItems.map(item => (
                  <AppCheckBox
                    key={item.id}
                    isChecked={selectedItems.includes(item.id)}
                    onClick={() => handleCheckBox(item.id)}
                    rightText={item.label}
                    uncheckedCheckBoxColor={AppColors.dimGray}
                  />
                ))}
              </View>
            </View>
            <Controller
              name="feedback"
              control={control}
              rules={{required: 'Feedback is required'}}
              render={({field: {onChange, value}}) => (
                <AppInput
                  label="Feedback"
                  placeholder="Description"
                  multiline={true}
                  value={value}
                  onChangeText={onChange}
                  inputStyle={styles.inputStyle}
                  error={errors.feedback?.message}
                />
              )}
            />
            {/* <AppInput
              label="Feedback"
              placeholder="Description"
              multiline={true}
              inputStyle={styles.inputStyle}
            /> */}
          </View>
          <AppButton
            title="Submit"
            onPress={handleSubmit(onSubmit)}
            style={styles.button}
            loading={isSubmitting}
            disabled={isSubmitting}
          />
          <AppButton
            title="Cancel"
            onPress={() => navigation.goBack()}
            style={styles.button}
          />
        </ScrollView>
      </View>

      <AppModal visible={visible} setVisible={setVisible} />
    </AppLayout>
  );
};

export default ParentFeedback;

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.white,
    paddingTop: hp(2),
    justifyContent: 'space-between',
    paddingBottom: hp(2),
  },
  inputStyle: {
    minHeight: hp(18),
    maxHeight: hp(20),
  },
  button: {backgroundColor: AppColors.black, width: '100%'},
  label: {
    marginBottom: 5,
    color: AppColors.black,
    fontSize: size.md,
    alignSelf: 'flex-start',
    fontFamily: AppFonts.NunitoSansBold,
  },
  sendToContainer: {
    marginTop: hp(1),
    marginBottom: hp(2),
  },
  checkBoxContainer: {
    marginLeft: hp(1),
    gap: 5,
  },
  boxStyle: {
    backgroundColor: AppColors.white,
    alignItems: 'center',
    borderColor: AppColors.black,
    height: hp(6),
    borderRadius: hp(0.5),
    marginBottom: hp(1.6),
  },
  errorText: {
    color: AppColors.red,
    fontSize: size.sl,
    fontFamily: AppFonts.NunitoSansRegular,
    marginTop: hp(0.5),
    marginLeft: hp(0.5),
  },
});
