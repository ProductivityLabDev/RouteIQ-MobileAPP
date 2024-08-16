import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { AppColors } from '../../utils/color';
import AppLayout from '../../layout/AppLayout';
import AppHeader from '../../components/AppHeader';
import AppStyles from '../../styles/AppStyles';
import AppFonts from '../../utils/appFonts';
import { hp, screenHeight, screenWidth, wp } from '../../utils/constants';
import { size } from '../../utils/responsiveFonts';
import { useNavigation } from '@react-navigation/native';
import GlobalIcon from '../../components/GlobalIcon';
import AppButton from '../../components/AppButton';
import { useAppDispatch } from '../../store/hooks';
import { saveToken, setLogout } from '../../store/user/userSlices';

const DriverProfile = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const [isEnabled, setIsEnabled] = useState(false);

  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  const settingItems = [
    {
      leftIcon: (
        <GlobalIcon
          library="FontelloIcon"
          name="group-2022"
          color={AppColors.red}
          size={hp(2.5)}
        />
      ),
      title: 'Profile Info',
      subTitle: ''
    },
    {
      leftIcon: (
        <GlobalIcon
          library="FontelloIcon"
          name="group-2019"
          color={AppColors.red}
          size={hp(2.5)}
        />
      ),
      title: 'Emergency Contact',
      subTitle: ''
    },
    {
      leftIcon: (
        <GlobalIcon
          library="FontelloIcon"
          name="group-2020"
          color={AppColors.red}
          size={hp(2.5)}
        />
      ),
      title: 'Qualification',
      subTitle: ''
    },
    {
      leftIcon: (
        <GlobalIcon
          library="FontelloIcon"
          name="group-2021"
          color={AppColors.red}
          size={hp(2.5)}
        />
      ),
      title: 'Certification',
      subTitle: ''
    },
    {
      leftIcon: (
        <GlobalIcon
          library="FontelloIcon"
          name="group-289239"
          color={AppColors.red}
          size={hp(2.5)}
        />
      ),
      title: 'Medical Record',
      subTitle: ' (Optional)'
    },
    {
      leftIcon: (
        <GlobalIcon
          library="FontelloIcon"
          name="group-2023"
          color={AppColors.red}
          size={hp(2.5)}
        />
      ),
      title: 'History',
      subTitle: ''
    },
    {
      leftIcon: (
        <GlobalIcon
          library="FontelloIcon"
          name="group-2024"
          color={AppColors.red}
          size={hp(2.5)}
        />
      ),
      title: 'Incident',
      subTitle: ''
    },
    {
      leftIcon: (
        <GlobalIcon
          library="FontelloIcon"
          name="group-2025"
          color={AppColors.red}
          size={hp(2.5)}
        />
      ),
      title: 'Shift Tracking',
      subTitle: ''
    },
    {
      leftIcon: (
        <GlobalIcon
          library="MaterialCommunityIcons"
          name="fuel"
          color={AppColors.red}
          size={hp(2.5)}
        />
      ),
      title: 'Fuel Code',
      subTitle: ''
    },
    {
      leftIcon: (
        <GlobalIcon
          library="FontelloIcon"
          name="lock"
          color={AppColors.red}
          size={hp(2.5)}
        />
      ),
      title: 'Change Password',
      subTitle: ''
    },
  ];

  const handleRoute = (name: string) => {
    if (name == 'Profile Info') navigation.navigate('DriverProfileInfo');
    if (name == 'Emergency Contact')
      navigation.navigate('DriverEmergencyContact');
    if (name == 'Qualification') navigation.navigate('DriverQualifications');
    if (name == 'Certification') navigation.navigate('DriverCertification');
    if (name == 'Change Password') navigation.navigate('DriverChangePassword');
    if (name == 'Medical Record')
      navigation.navigate('DriverMedicalRecord');
    if (name == 'History') navigation.navigate('DriverHistory');
    if (name == 'Incident') navigation.navigate('DriverIncident');
    if (name == 'Shift Tracking') navigation.navigate('DriverShiftTracking');
  };

  return (
    <AppLayout
      statusbackgroundColor={AppColors.red}
      style={{ backgroundColor: AppColors.profileBg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ height: screenHeight }}>
        <ImageBackground
          style={styles.headerImage}
          source={require('../../assets/images/redCurvedBorderBg.png')}>
          <AppHeader
            role="Driver"
            title="Profile"
            enableBack={false}
            rightIcon={false}
            containerStyle={{ height: hp(11) }}
          />
          <View style={styles.imageContainer}>
            <Image
              style={styles.image}
              source={require('../../assets/images/profile_image.webp')}
            />
          </View>

          <Text
            style={[
              AppStyles.subHeading,
              {
                color: AppColors.white,
                fontFamily: AppFonts.NunitoSansBold,
                alignSelf: 'center',
                fontSize: size.lg,
                marginTop: hp(1),
              },
            ]}>
            Mark Tommay
          </Text>

          <View style={[AppStyles.rowBetween, styles.headerBottomContainer]}>
            <View style={styles.headerTitle}>
              <Text style={styles.headerSubTitle}>Employee ID:</Text>
              <Text
                style={[
                  AppStyles.subHeading,
                  {
                    color: AppColors.white,
                    fontFamily: AppFonts.NunitoSansBold,
                  },
                ]}>
                B456788
              </Text>
            </View>
            <View style={styles.headerTitle}>
              <Text
                style={[
                  styles.headerSubTitle,
                  { fontFamily: AppFonts.NunitoSansSemiBold, textAlign: 'right' },
                ]}>
                Status:
              </Text>
              <Text
                style={[
                  AppStyles.subHeading,
                  {
                    color: AppColors.white,
                    fontFamily: AppFonts.NunitoSansBold,
                  },
                ]}>
                Part Time
              </Text>
            </View>
          </View>

          <View style={styles.mainItemsContainer}>
            {settingItems.map((item, index) => (
              <Pressable
                onPress={() => handleRoute(item.title)}
                key={index}
                style={[AppStyles.rowBetween, styles.itemContainer]}>
                <View style={[AppStyles.row]}>
                  {item.leftIcon}
                  <Text
                    style={[
                      AppStyles.title,
                      {
                        fontSize: size.default,
                        marginLeft: hp(1),
                        fontFamily: AppFonts.NunitoSansSemiBold,
                        top: hp(-0.4),
                      },
                    ]}>
                    {item.title}{item.subTitle && <Text style={{ color: AppColors.red }}>{item.subTitle}</Text>}
                  </Text>
                </View>
                <GlobalIcon
                  library="Entypo"
                  name="chevron-small-right"
                  color={AppColors.red}
                  size={hp(3)}
                />
              </Pressable>
            ))}
          </View>

          <AppButton
            title="Logout"
            onPress={() => { dispatch(setLogout(true)); dispatch(saveToken(null)) }}
            style={{
              // width: '100%',
              width: '90%',
              backgroundColor: AppColors.black,
              height: hp(6),
              marginHorizontal: wp(7),
              alignSelf: 'center',
              position: 'relative',
              top: -5,
            }}
            titleStyle={{ fontSize: size.md }}
          />
        </ImageBackground>
      </ScrollView>
    </AppLayout>
  );
};

export default DriverProfile;

const styles = StyleSheet.create({
  mainItemsContainer: {
    paddingHorizontal: wp(4),
    marginHorizontal: wp(4),
    borderRadius: hp(3),
    backgroundColor: AppColors.white,
    paddingVertical: hp(2),
    position: 'relative',
    top: hp(-1.3),
    borderColor: AppColors.lightGrey,
    borderWidth: 1,
    elevation: 5,
  },

  itemContainer: {
    backgroundColor: AppColors.white,
    paddingHorizontal: hp(1),
    paddingVertical: hp(1.2),
    marginVertical: hp(0),
  },

  headerImage: {
    height: 400,
    width: screenWidth,
    paddingTop: hp(0),
    position: 'absolute',
  },
  layoutContainer: { backgroundColor: 'rgba(16, 35, 53, 0)', paddingTop: 0 },
  headerBottomContainer: {
    alignItems: 'flex-start',
    paddingHorizontal: hp(2),
    height: hp(10),
    marginTop: hp(0),
    zIndex: 1,
  },
  imageContainer: {
    height: hp(9),
    width: hp(9),
    alignSelf: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 0,
  },
  reactangleIcon: {
    height: 100,
    width: screenWidth,
    backgroundColor: 'rgba(16, 35, 53, 0)',
    position: 'absolute',
    top: 60,
    elevation: 0,
    opacity: 1,
  },
  headerTitle: { gap: hp(0.5), paddingTop: hp(1) },
  headerSubTitle: {
    fontFamily: AppFonts.NunitoSansMedium,
    fontSize: size.sl,
    lineHeight: 20,
    color: AppColors.white,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: hp(10),
    position: 'static',
    borderColor: AppColors.white,
    borderWidth: 1,
  },
  bottomContainer: {
    zIndex: 1,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
    height: hp(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    paddingHorizontal: hp(2),
  },
  bottomButton: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: AppColors.black,
    height: hp(6),
    width: hp(6),
  },
  boxStyle: {
    marginBottom: hp(1.6),
    backgroundColor: AppColors.white,
    alignItems: 'center',
    borderColor: AppColors.black,
    height: hp(6),
    borderRadius: hp(0.5),
  },
  cancelButton: { width: '35%', backgroundColor: AppColors.lightGrey },
  submitButton: { width: '60%', backgroundColor: AppColors.black },
  label: {
    marginBottom: 5,
    color: AppColors.black,
    fontSize: size.md,
    alignSelf: 'flex-start',
    fontFamily: AppFonts.NunitoSansSemiBold,
  },
  reasonContainer: {
    padding: hp(2),
    backgroundColor: '#dddde1',
    borderRadius: hp(1),
    marginBottom: hp(3),
  },
});
