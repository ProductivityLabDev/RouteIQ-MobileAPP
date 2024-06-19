import {Image, StyleSheet, Text, View} from 'react-native';
import React, {useState} from 'react';
import {hp} from '../utils/constants';
import {AppColors} from '../utils/color';
import AppButton from './AppButton';
import {fontSize, size} from '../utils/responsiveFonts';
import AppStyles from '../styles/AppStyles';
import {StudentCardProps} from '../types/types';
import AppFonts from '../utils/appFonts';
import {truncateString} from '../utils/functions';
import {useNavigation} from '@react-navigation/native';
import {useAppDispatch} from '../store/hooks';
import {setStudentDetail} from '../store/driver/driverSlices';

const StudentCard: React.FC<StudentCardProps> = ({position, item}) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [present, setPresent] = useState(false);
  return (
    <View
      style={[
        styles.container,
        position == 'row' ? styles.rowContainer : styles.columnContainer,
      ]}>
      <View
        style={
          position == 'row' ? styles.imgContainer : styles.columnImgContainer
        }>
        <Image style={styles.img} source={item?.image} />
        {present && (
          <View
            style={[
              AppStyles.widthHeightFullPercent,
              styles.transparentContainer,
            ]}>
            <AppButton
              disabled={true}
              title="Present"
              style={styles.button}
              titleStyle={styles.buttonTitle}
            />
          </View>
        )}
      </View>
      <View
        style={
          position == 'row'
            ? {height: hp(18), gap: 8, paddingTop: hp(0.5)}
            : {marginLeft: hp(1)}
        }>
        <View
          style={
            position == 'row' ? AppStyles.alignJustifyCenter : {bottom: 10}
          }>
          <Text style={[AppStyles.titleHead, {fontSize: size.md}]}>
            {position == 'row'
              ? truncateString(item?.name, 12)
              : truncateString(item?.name, 20)}
          </Text>
          <Text style={[AppStyles.whiteSubTitle, {color: AppColors.dimGray}]}>
            {item?.age} years
          </Text>
        </View>
        <View
          style={
            position == 'row' ? styles.btnContainer : styles.columnBtnContainer
          }>
          {!present && (
            <AppButton
              title="Present"
              style={
                position == 'row'
                  ? {...styles.presentBtn}
                  : {...styles.presentColumnBtn}
              }
              titleStyle={styles.presentTitle}
              onPress={() => setPresent(true)}
            />
          )}
          <AppButton
            title="Details"
            style={
              position == 'row'
                ? styles.detailBtn
                : {...styles.detailColumnBtn, width: present ? '100%' : '48%'}
            }
            titleStyle={styles.detailTitle}
            onPress={() => {
              dispatch(setStudentDetail(item));
              navigation.navigate('DriverStudentDetail');
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default StudentCard;

const styles = StyleSheet.create({
  container: {
    marginTop: hp(2),
    backgroundColor: AppColors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  rowContainer: {
    width: '48%',
    paddingVertical: hp(2),
    paddingHorizontal: hp(2),
  },
  columnContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: hp(1.5),
    paddingVertical: hp(1.5),
  },
  btnContainer: {
    width: '100%',
    marginTop: hp(1),
  },
  columnBtnContainer: {
    width: '80%',
    top: hp(2),
    flexDirection: 'row',
    gap: 5,
  },
  imgContainer: {
    height: hp(13),
    width: '100%',
  },
  columnImgContainer: {
    height: hp(17),
    width: hp(14),
  },
  img: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
    borderRadius: 8,
  },
  presentBtn: {
    width: '100%',
    height: hp(4),
    borderRadius: 5,
    backgroundColor: AppColors.green,
  },
  presentColumnBtn: {
    width: '48%',
    height: hp(4),
    borderRadius: 5,
    backgroundColor: AppColors.green,
  },
  presentTitle: {
    width: '100%',
    textAlign: 'center',
    fontSize: fontSize(14),
  },
  detailBtn: {
    width: '100%',
    height: hp(4),
    borderRadius: 5,
    backgroundColor: AppColors.transparent,
    borderWidth: 1,
    borderColor: AppColors.dimGray,
    marginBottom: 0,
  },
  detailColumnBtn: {
    width: '48%',
    height: hp(4),
    borderRadius: 5,
    backgroundColor: AppColors.transparent,
    borderWidth: 1,
    borderColor: AppColors.dimGray,
    marginBottom: 0,
  },
  detailTitle: {
    width: '100%',
    textAlign: 'center',
    fontSize: fontSize(14),
    color: AppColors.black,
  },
  transparentContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(34, 139, 34, 0.4)',
    zIndex: 1,
    borderRadius: 8,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  button: {
    backgroundColor: AppColors.white,
    borderColor: AppColors.green,
    borderWidth: 1.5,
    borderRadius: 50,
    height: hp(3.5),
    bottom: hp(0.5),
    width: hp(9),
  },
  buttonTitle: {
    color: AppColors.green,
    fontSize: size.sl,
    fontFamily: AppFonts.NunitoSansBold,
  },
});
