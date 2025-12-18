import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import GlobalIcon from '../components/GlobalIcon';
import AppFonts from './appFonts';
import {AppColors} from './color';
import {hp} from './constants';

type ToastRenderProps = {
  text1?: string;
  text2?: string;
};

const ToastCard = ({
  variant,
  text1,
  text2,
}: ToastRenderProps & {variant: 'success' | 'error' | 'info'}) => {
  const accentColor =
    variant === 'success'
      ? AppColors.green
      : variant === 'error'
      ? AppColors.red
      : AppColors.black;

  const iconName =
    variant === 'success'
      ? 'checkmark-circle'
      : variant === 'error'
      ? 'close-circle'
      : 'information-circle';

  return (
    <View style={[styles.card, {borderLeftColor: accentColor}]}>
      <View style={[styles.iconWrap, {backgroundColor: accentColor}]}>
        <GlobalIcon
          library="Ionicons"
          name={iconName}
          color={AppColors.white}
          size={hp(2.6)}
        />
      </View>
      <View style={styles.textWrap}>
        {!!text1 && (
          <Text style={styles.title} numberOfLines={1}>
            {text1}
          </Text>
        )}
        {!!text2 && (
          <Text style={styles.message} numberOfLines={2}>
            {text2}
          </Text>
        )}
      </View>
    </View>
  );
};

export const toastConfig = {
  success: ({text1, text2}: ToastRenderProps) => (
    <ToastCard variant="success" text1={text1} text2={text2} />
  ),
  error: ({text1, text2}: ToastRenderProps) => (
    <ToastCard variant="error" text1={text1} text2={text2} />
  ),
  info: ({text1, text2}: ToastRenderProps) => (
    <ToastCard variant="info" text1={text1} text2={text2} />
  ),
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 5,
    backgroundColor: AppColors.white,
    borderRadius: hp(1.2),
    paddingVertical: hp(1.2),
    paddingHorizontal: hp(1.2),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  iconWrap: {
    height: hp(4.2),
    width: hp(4.2),
    borderRadius: hp(2.1),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: hp(1.1),
  },
  textWrap: {flex: 1},
  title: {
    fontFamily: AppFonts.NunitoSansBold,
    fontSize: 14,
    color: AppColors.black,
  },
  message: {
    fontFamily: AppFonts.NunitoSansRegular,
    fontSize: 12,
    color: AppColors.textLightGrey,
    marginTop: hp(0.2),
  },
});


