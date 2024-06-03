import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {Image, Pressable, StyleSheet, Switch, Text, View} from 'react-native';
import AppButton from '../../components/AppButton';
import AppHeader from '../../components/AppHeader';
import GlobalIcon from '../../components/GlobalIcon';
import AppLayout from '../../layout/AppLayout';
import AppStyles from '../../styles/AppStyles';
import AppFonts from '../../utils/appFonts';
import {AppColors} from '../../utils/color';
import {hp} from '../../utils/constants';
import {size} from '../../utils/responsiveFonts';
import GuardianIcon from '../../assets/svgs/GuardianIcon';

export default function Settings() {
  const navigation = useNavigation();
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  const settingItems = [
    {
      leftIcon: (
        <GlobalIcon
          library="FontAwesome"
          name="user-circle-o"
          color={AppColors.red}
          size={hp(2.5)}
        />
      ),
      screen: 'ChildProfile',
      title: 'Child Profile',
      disabled: false,
    },
    {
      leftIcon: (
        <GlobalIcon
          library="CustomIcon"
          name="domain_verification"
          color={AppColors.red}
          size={hp(2.5)}
        />
      ),
      screen: 'AttendanceHistory',
      title: 'Attendance History',
      disabled: false,
    },
    {
      leftIcon: <GuardianIcon />,
      screen: 'UpdateGuardianProfile',
      title: 'Guardian 1',
      disabled: false,
    },
    {
      leftIcon: <GuardianIcon />,
      screen: 'UpdateGuardianProfile',
      title: 'Guardian 2',
      disabled: false,
    },
    {
      leftIcon: (
        <GlobalIcon
          library="CustomIcon"
          name="notifications"
          color={AppColors.red}
          size={hp(2.5)}
        />
      ),
      screen: 'ChildProfile',
      title: 'Push Notification',
      disabled: true,
    },
  ];

  return (
    <AppLayout>
      <AppHeader title="Settings" enableBack={true} rightIcon={false} />
      <View
        style={[AppStyles.container, {backgroundColor: AppColors.screenColor}]}>
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={require('../../assets/images/auth_background.png')}
          />
        </View>

        <View>
          {settingItems.map((item: any, index: number) => (
            <Pressable
              onPress={() =>
                item.screen == 'UpdateGuardianProfile'
                  ? navigation.navigate(item.screen, {title: item.title})
                  : navigation.navigate(item.screen)
              }
              disabled={item.disabled}
              key={index}
              style={[AppStyles.rowBetween, styles.itemContainer]}>
              <View style={[AppStyles.row]}>
                {item.leftIcon}
                <Text style={styles.title}>{item.title}</Text>
              </View>
              {item.title === 'Push Notification' ? (
                <Switch
                  onValueChange={toggleSwitch}
                  value={isEnabled}
                  trackColor={{false: '#767577', true: AppColors.red}}
                  thumbColor={isEnabled ? AppColors.white : '#f4f3f4'}
                  style={{transform: [{scale: 1.3}]}}
                />
              ) : (
                <GlobalIcon
                  library="Ionicons"
                  name="chevron-forward-outline"
                  color={AppColors.red}
                  size={hp(2.3)}
                />
              )}
            </Pressable>
          ))}
        </View>

        <AppButton
          onPress={() => navigation.navigate('HomeSreen')}
          title="Logout"
          style={styles.button}
        />
      </View>
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
    height: hp(15),
    width: hp(15),
    borderRadius: hp(20),
    borderColor: AppColors.white,
    borderWidth: 2,
    alignSelf: 'center',
    marginVertical: hp(4),
  },
  image: {
    height: '100%',
    width: '100%',
    borderRadius: hp(16),
  },
  title: {
    fontSize: size.md,
    marginLeft: hp(1),
    fontFamily: AppFonts.NunitoSansSemiBold,
    color: AppColors.black,
  },
  button: {
    alignSelf: 'center',
    width: '100%',
    backgroundColor: AppColors.black,
    position: 'absolute',
    bottom: hp(8),
  },
});
