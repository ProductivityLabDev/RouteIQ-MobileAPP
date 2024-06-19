import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useCallback, useMemo, useRef} from 'react';
import AppLayout from '../../layout/AppLayout';
import {AppColors} from '../../utils/color';
import AppHeader from '../../components/AppHeader';
import AppStyles from '../../styles/AppStyles';
import {hp} from '../../utils/constants';
import AppFonts from '../../utils/appFonts';
import AppButton from '../../components/AppButton';
import GlobalIcon from '../../components/GlobalIcon';
import {useAppSelector} from '../../store/hooks';
import AppBottomSheet from '../../components/AppBottomSheet';
import {BottomSheetModal} from '@gorhom/bottom-sheet';

const DriverStudentDetail = () => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const studentDetail = useAppSelector(
    state => state.driverSlices.studentDetail,
  );

  const snapPoints = useMemo(() => ['28%', '90%'], []);
  const openSheet = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const closeSheet = useCallback(() => {
    bottomSheetModalRef.current?.close();
  }, []);
  return (
    <AppLayout
      statusbackgroundColor={AppColors.red}
      style={{backgroundColor: AppColors.driverScreen}}>
      <AppHeader
        role="Driver"
        title="Students Details"
        enableBack={true}
        profile_image={false}
        rightIcon={false}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[AppStyles.driverContainer, {paddingHorizontal: 0}]}>
          <View style={[AppStyles.alignJustifyCenter, {marginBottom: hp(2)}]}>
            <Image style={styles.image} source={studentDetail?.image} />
          </View>
          <View style={styles.container}>
            <View style={[AppStyles.rowBetween, styles.textContainer]}>
              <Text style={[AppStyles.halfWidth, AppStyles.title]}>Name</Text>
              <Text
                style={[
                  AppStyles.halfWidth,
                  AppStyles.subTitle,
                  {color: AppColors.charcoal},
                ]}>
                {studentDetail?.name}
              </Text>
            </View>
            <View style={[AppStyles.rowBetween, styles.textContainer]}>
              <Text style={[AppStyles.halfWidth, AppStyles.title]}>
                Emergency Contact
              </Text>
              <Text
                style={[
                  AppStyles.halfWidth,
                  AppStyles.subTitle,
                  {color: AppColors.charcoal},
                ]}>
                {studentDetail?.emergency_contact}
              </Text>
            </View>
            <View style={[AppStyles.rowBetween, styles.textContainer]}>
              <Text style={[AppStyles.halfWidth, AppStyles.title]}>
                School Name
              </Text>
              <Text
                style={[
                  AppStyles.halfWidth,
                  AppStyles.subTitle,
                  {color: AppColors.charcoal},
                ]}>
                {studentDetail?.school_name}
              </Text>
            </View>
            <View style={[AppStyles.rowBetween, styles.textContainer]}>
              <Text style={[AppStyles.halfWidth, AppStyles.title]}>
                Transportation Preference
              </Text>
              <Text
                style={[
                  AppStyles.halfWidth,
                  AppStyles.subTitle,
                  {color: AppColors.charcoal},
                ]}>
                {studentDetail?.transportation_preference}
              </Text>
            </View>
            <View style={[AppStyles.rowBetween, styles.textContainer]}>
              <Text style={[AppStyles.halfWidth, AppStyles.title]}>
                Medical Details
              </Text>
              <Text
                style={[
                  AppStyles.halfWidth,
                  AppStyles.subTitle,
                  {color: AppColors.charcoal},
                ]}>
                {studentDetail?.medical_details}
              </Text>
            </View>
            <FlatList
              scrollEnabled={false}
              data={studentDetail?.guardians}
              renderItem={({item, index}) => (
                <>
                  <View style={[AppStyles.rowBetween, styles.textContainer]}>
                    <Text
                      style={[
                        AppStyles.halfWidth,
                        AppStyles.title,
                        {fontFamily: AppFonts.NunitoSansBold},
                      ]}>
                      Guardian {index + 1}:
                    </Text>
                  </View>
                  <View style={[AppStyles.rowBetween, styles.textContainer]}>
                    <Text style={[AppStyles.halfWidth, AppStyles.title]}>
                      Name
                    </Text>
                    <Text
                      style={[
                        AppStyles.halfWidth,
                        AppStyles.subTitle,
                        {color: AppColors.charcoal},
                      ]}>
                      {item?.name}
                    </Text>
                  </View>
                  <View style={[AppStyles.rowBetween, styles.textContainer]}>
                    <Text style={[AppStyles.halfWidth, AppStyles.title]}>
                      Relation
                    </Text>
                    <Text
                      style={[
                        AppStyles.halfWidth,
                        AppStyles.subTitle,
                        {color: AppColors.charcoal},
                      ]}>
                      {item?.relation}
                    </Text>
                  </View>
                  <View style={[AppStyles.rowBetween, styles.textContainer]}>
                    <Text style={[AppStyles.halfWidth, AppStyles.title]}>
                      Phone Number
                    </Text>
                    <Text
                      style={[
                        AppStyles.halfWidth,
                        AppStyles.subTitle,
                        {color: AppColors.charcoal},
                      ]}>
                      {item?.phone_number}
                    </Text>
                  </View>
                </>
              )}
            />
          </View>
          <View style={{padding: hp(2), gap: 10}}>
            <AppButton
              title="Add Feedback"
              style={AppStyles.widthFullPercent}
              leftIcon={
                <GlobalIcon
                  library="MaterialIcons"
                  name="edit"
                  color={AppColors.white}
                />
              }
              onPress={() => openSheet()}
            />
            <AppButton
              title="Message Guardian"
              style={AppStyles.widthFullPercent}
            />
          </View>
        </View>
      </ScrollView>

      <AppBottomSheet
        bottomSheetModalRef={bottomSheetModalRef}
        snapPoints={snapPoints}
        backdropComponent={({style}) => (
          <Pressable
            onPress={() => closeSheet()}
            style={[style, {backgroundColor: 'rgba(0, 0, 0, 0.6)'}]}
          />
        )}>
        <View>
          <Text style={AppStyles.title}>Add Feedback</Text>
        </View>
      </AppBottomSheet>
    </AppLayout>
  );
};

export default DriverStudentDetail;

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.white,
    paddingHorizontal: hp(2),
    paddingVertical: hp(2),
  },
  image: {
    height: hp(20),
    width: hp(17),
    resizeMode: 'cover',
    borderRadius: 8,
  },
  textContainer: {alignItems: 'flex-start', marginBottom: hp(2)},
});
