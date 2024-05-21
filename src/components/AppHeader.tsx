import { Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import GlobalIcon from './GlobalIcon';
import { AppColors } from '../utils/color';
import AppStyles from '../styles/AppStyles';
import { useNavigation } from '@react-navigation/native';
import { hp } from '../utils/constants';
import { size } from '../utils/responsiveFonts';
import AppFonts from '../utils/appFonts';

interface AppHeaderProps {
  title?: string,
  greetTitle?: string,
  enableBack?: any,
  rightIcon?: boolean,
  bookmarkIcon?: boolean,
  onPressLeftIcon?: any,
  onPressRightIcon?: any,
}

const AppHeader: React.FC<AppHeaderProps> = ({ title, greetTitle, enableBack, rightIcon = true, bookmarkIcon = false, onPressLeftIcon, onPressRightIcon }) => {
  const navigation = useNavigation()

  return (
    <View style={styles.mainContainer}>
      {greetTitle && <Text style={styles.greetTitle}>{greetTitle}</Text>}
      <View style={AppStyles.rowBetween}>
        <View style={styles.iconContainer}>
          {!enableBack && <Pressable style={styles.icon} onPress={onPressLeftIcon}>
            <GlobalIcon
              library="CustomIcon"
              name="settings"
              color={AppColors.white}
              size={hp(3)}
            />
          </Pressable>}
          {enableBack &&
            <Pressable onPress={() => navigation.goBack()} style={styles.icon}>
              <GlobalIcon
                library="Ionicons"
                name="chevron-back"
                color={AppColors.white}
                size={hp(3)}
              />
            </Pressable>
          }
        </View>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.iconContainer, { alignItems: 'flex-end' }]}>
          {!bookmarkIcon && rightIcon && <Pressable style={styles.icon} onPress={onPressRightIcon}>
            <GlobalIcon
              library="CustomIcon"
              name="notifications"
              color={AppColors.white}
              size={hp(3)}
            />
          </Pressable>}
          {!rightIcon && bookmarkIcon && <Pressable style={styles.icon}>
            <GlobalIcon
              library="Ionicons"
              name="bookmarks"
              color={AppColors.black}
              size={hp(2.5)}
            />
          </Pressable>}
        </View>
      </View>
    </View>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    marginTop: hp(2.1),
    marginBottom: hp(2.1),
    backgroundColor: AppColors.black,
    paddingHorizontal: hp(1)
  },
  title: {
    width: '60%',
    textAlign: 'center',
    fontSize: size.vxlg,
    color: AppColors.white,
    fontFamily: AppFonts.NunitoSansMedium
  },
  iconContainer: { width: '20%' },
  icon: { padding: hp(1) },
  greetTitle: {
    textAlign: 'center',
    fontSize: size.md,
    color: AppColors.black,
  },
});
