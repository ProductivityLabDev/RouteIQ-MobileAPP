import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import AppLayout from '../../layout/AppLayout';
import {AppColors} from '../../utils/color';
import AppHeader from '../../components/AppHeader';
import AppStyles from '../../styles/AppStyles';
import {hp} from '../../utils/constants';
import AppFonts from '../../utils/appFonts';
import AppButton from '../../components/AppButton';
import GlobalIcon from '../../components/GlobalIcon';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import AppBottomSheet from '../../components/AppBottomSheet';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import AppInput from '../../components/AppInput';
import Modal from 'react-native-modal';
import {size} from '../../utils/responsiveFonts';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Dropdown} from 'react-native-element-dropdown';
import {fetchRetailRFQDetail, clearRetailRFQDetail} from '../../store/retailer/retailerSlice';
import moment from 'moment';

const Row = ({label, value}: {label: string; value?: string | number | null}) => (
  <View style={[AppStyles.rowBetween, styles.textContainer]}>
    <Text style={[AppStyles.halfWidth, AppStyles.title]}>{label}</Text>
    <Text style={[AppStyles.halfWidth, AppStyles.subTitle, {color: AppColors.charcoalGray}]}>
      {value != null ? String(value) : '—'}
    </Text>
  </View>
);

const RetailDetail = () => {
  const navigation = useNavigation();
  const route = useRoute() as any;
  const dispatch = useAppDispatch();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const requestId: number | undefined = route.params?.requestId;

  const rfqDetail = useAppSelector(state => state.retailerSlices.rfqDetail);
  const rfqDetailStatus = useAppSelector(state => state.retailerSlices.rfqDetailStatus);

  const [dropdownValue, setDropdownValue] = useState(null);
  const snapPoints = useMemo(() => ['50%', '90%'], []);
  const openSheet = useCallback(() => bottomSheetModalRef.current?.present(), []);
  const closeSheet = useCallback(() => bottomSheetModalRef.current?.close(), []);
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (requestId) {
      dispatch(fetchRetailRFQDetail(requestId));
    }
    return () => {
      dispatch(clearRetailRFQDetail());
    };
  }, [dispatch, requestId]);

  const handleSubmitFeedBack = () => {
    closeSheet();
    setModalVisible(true);
    setTimeout(() => setModalVisible(false), 2000);
  };

  const dropdownData = [
    {label: 'School', value: '1'},
    {label: 'Vendor', value: '2'},
    {label: 'Guardian', value: '3'},
    {label: 'All', value: '4'},
  ];

  const d = rfqDetail as any;
  const canEdit = d?.Status === 'Pending' || d?.Status === 'Declined';

  if (rfqDetailStatus === 'loading' || !rfqDetail) {
    return (
      <AppLayout statusbackgroundColor={AppColors.red} style={{backgroundColor: AppColors.driverScreen}}>
        <AppHeader role="Driver" title="Details" enableBack={true} rightIcon={false} />
        <ActivityIndicator color={AppColors.red} size="large" style={{marginTop: hp(4)}} />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      statusbackgroundColor={AppColors.red}
      style={{backgroundColor: AppColors.driverScreen}}>
      <AppHeader
        role="Driver"
        title={d.RequestNumber || 'Details'}
        enableBack={true}
        profile_image={false}
        rightIcon={false}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Row label="Request Number" value={d.RequestNumber} />
          <Row label="Status" value={d.Status} />
          <Row label="Company/Group Name" value={d.companyGroupName ?? d.CompanyGroupName} />
          <Row label="Phone Number" value={d.phone ?? d.Phone} />
          <Row label="Email Address" value={d.email ?? d.Email} />
          <Row label="Type of Group" value={d.typeOfGroup ?? d.TypeOfGroup} />
          <Row label="Round Trip" value={d.isRoundTrip != null ? (d.isRoundTrip ? 'Yes' : 'No') : null} />
          <Row label="Number of Passengers" value={d.numberOfPassengers ?? d.NumberOfPassengers} />
          <Row label="Wheelchair Lift" value={d.wheelchairLiftRequired != null ? (d.wheelchairLiftRequired ? 'Yes' : 'No') : null} />
          <Row label="Bus Type" value={d.busType ?? d.BusType} />
          <Row label="Pickup Date" value={d.PickupDate ? moment(d.PickupDate).format('MMM D, YYYY') : null} />
          <Row label="Pickup Time" value={d.PickupTime ? moment(d.PickupTime).format('h:mm A') : null} />
          <Row label="Return Date" value={(d.returnDate ?? d.ReturnDate) ? moment(d.returnDate ?? d.ReturnDate).format('MMM D, YYYY') : null} />
          <Row label="Return Time" value={(d.returnTime ?? d.ReturnTime) ? moment(d.returnTime ?? d.ReturnTime).format('h:mm A') : null} />
          <Row label="Pickup Location" value={d.PickupLocation} />
          <Row label="Pickup Address" value={d.pickupAddress ?? d.PickupAddress} />
          <Row label="Pickup City" value={d.pickupCity ?? d.PickupCity} />
          <Row label="Pickup State" value={d.pickupState ?? d.PickupState} />
          <Row label="Pickup Zip" value={d.pickupZip ?? d.PickupZip} />
          <Row label="Destination Location" value={d.DestinationLocation} />
          <Row label="Destination Address" value={d.destinationAddress ?? d.DestinationAddress} />
          <Row label="Destination City" value={d.destinationCity ?? d.DestinationCity} />
          <Row label="Destination State" value={d.destinationState ?? d.DestinationState} />
          <Row label="Destination Zip" value={d.destinationZip ?? d.DestinationZip} />
          <Row label="Referred By" value={d.referredBy ?? d.ReferredBy} />
          {d.QuotedAmount != null && <Row label="Quoted Amount" value={`$${d.QuotedAmount}`} />}
          {d.driverName && <Row label="Assigned Driver" value={d.driverName} />}
          {d.VehicleNumber && <Row label="Vehicle Number" value={d.VehicleNumber} />}

          {canEdit && (
            <AppButton
              onPress={() =>
                navigation.navigate('EditRetailDetail', {requestId: d.RequestId, rfq: d})
              }
              title="Edit RFQ"
              style={styles.button}
              titleStyle={styles.buttonTitle}
            />
          )}
          <AppButton title="Send Feedback" onPress={openSheet} style={{marginTop: hp(1)}} />
        </View>
      </ScrollView>

      <AppBottomSheet
        bottomSheetModalRef={bottomSheetModalRef}
        snapPoints={snapPoints}
        backdropComponent={({style}: any) => (
          <Pressable
            onPress={() => closeSheet()}
            style={[style, {backgroundColor: 'rgba(0, 0, 0, 0.6)'}]}
          />
        )}>
        <Text style={[AppStyles.title, {fontFamily: AppFonts.NunitoSansBold, marginBottom: hp(1)}]}>
          Sent To
        </Text>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          containerStyle={{borderWidth: 0.5, borderColor: AppColors.black, borderRadius: hp(1)}}
          itemContainerStyle={{borderRadius: hp(1)}}
          data={dropdownData}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Select"
          value={dropdownValue}
          onChange={item => setDropdownValue(item.value)}
          renderRightIcon={() => (
            <GlobalIcon library="Entypo" color={AppColors.black} name="chevron-down" size={20} />
          )}
        />
        <AppInput
          multiline
          numberOfLines={8}
          container={{height: hp(16), borderRadius: hp(0.5), marginBottom: hp(2)}}
          label="Feedback"
          placeholder="Description"
          labelStyle={{marginBottom: hp(2), fontFamily: AppFonts.NunitoSansBold}}
        />
        <View style={[AppStyles.rowBetween, {width: '100%'}]}>
          <AppButton
            title="Cancel"
            onPress={() => closeSheet()}
            style={styles.backButton}
            titleStyle={{color: AppColors.textLightGrey}}
          />
          <AppButton title="Submit" onPress={handleSubmitFeedBack} style={styles.submitButton} />
        </View>
      </AppBottomSheet>

      <Modal
        isVisible={isModalVisible}
        backdropTransitionInTiming={0}
        coverScreen={true}
        animationIn="fadeInRightBig"
        backdropOpacity={0.5}
        useNativeDriver
        hideModalContentWhileAnimating
        backdropTransitionOutTiming={0}
        onSwipeComplete={() => setModalVisible(false)}
        swipeDirection="left"
        onBackdropPress={() => setModalVisible(false)}
        style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
        <View
          style={{
            width: '70%',
            height: '40%',
            backgroundColor: AppColors.white,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 10,
          }}>
          <GlobalIcon name={'group-(6)'} library="FontelloIcon" color={AppColors.red} size={hp(8)} />
          <Text style={[AppStyles.titleHead, {fontFamily: AppFonts.NunitoSansBold, marginTop: hp(3)}]}>
            Thankyou
          </Text>
          <Text style={[AppStyles.title, {fontFamily: AppFonts.NunitoSansSemiBold, fontSize: size.lg}]}>
            For your feedback
          </Text>
        </View>
      </Modal>
    </AppLayout>
  );
};

export default RetailDetail;

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.white,
    paddingHorizontal: hp(2),
    paddingVertical: hp(2),
  },
  textContainer: {alignItems: 'flex-start', marginBottom: hp(2)},
  backButton: {width: '36%', backgroundColor: AppColors.screenColor},
  submitButton: {width: '60%'},
  dropdown: {
    height: 50,
    borderColor: 'black',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: hp(2),
  },
  placeholderStyle: {fontSize: 16},
  selectedTextStyle: {fontSize: 16},
  iconStyle: {width: 20, height: 20},
  inputSearchStyle: {height: 40, fontSize: 16},
  button: {
    width: '100%',
    backgroundColor: AppColors.white,
    borderColor: AppColors.red,
    borderWidth: 1.5,
    marginBottom: hp(2),
    alignSelf: 'center',
  },
  buttonTitle: {color: AppColors.black},
});
