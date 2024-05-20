import { ActivityIndicator, StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native'
import React from 'react'
import { AppColors } from '../utils/color';
import { hp } from '../utils/constants';
import { size } from '../utils/responsiveFonts';
import AppFonts from '../utils/appFonts';

interface AppButtonProps {
    title: string;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    titleStyle?: StyleProp<TextStyle>;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    disabled?: boolean;
    loading?: boolean
}

const AppButton: React.FC<AppButtonProps> = ({title, onPress, style, titleStyle, leftIcon, rightIcon, disabled, loading}) => {
  return (
    <TouchableOpacity disabled={disabled} onPress={onPress} style={[styles.container, style]}>
      {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
      {loading ? <ActivityIndicator size="small" color={AppColors.black} /> : <Text style={[styles.title, titleStyle]}>{title}</Text>}
      {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
    </TouchableOpacity>
  )
}

export default AppButton

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: hp(6),
        borderRadius: hp(6),
        backgroundColor: AppColors.primary,
        marginVertical: hp(.5)
    },
    title: {
        color: AppColors.secondary,
        fontFamily: AppFonts.NunitoSansRegular,
        fontSize: size.default
    },
    leftIcon: {marginRight: hp(.5)},
    rightIcon: {marginLeft: hp(.5)},
})