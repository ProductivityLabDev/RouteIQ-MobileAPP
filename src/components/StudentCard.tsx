import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { hp } from '../utils/constants';
import { AppColors } from '../utils/color';
import AppButton from './AppButton';
import { fontSize, size } from '../utils/responsiveFonts';
import AppStyles from '../styles/AppStyles';
import { StudentCardProps } from '../types/types';
import AppFonts from '../utils/appFonts';
import { truncateString } from '../utils/functions';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setStudentDetail } from '../store/driver/driverSlices';
import { studentsData } from '../utils/DummyData';
import GlobalIcon from './GlobalIcon';
import { getApiBaseUrl } from '../utils/apiConfig';
import { showErrorToast } from '../utils/toast';

const StudentCard: React.FC<StudentCardProps> = ({
  position,
  item,
  index,
  onAttendanceChange,
}) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const token = useAppSelector(state => state.userSlices.token);
  const initialStatus =
    item?.attendanceStatus === 'present' || item?.attendanceStatus === 'absent'
      ? item.attendanceStatus
      : null;
  const [status, setStatus] = useState<'present' | 'absent' | null>(initialStatus);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const lastIndex = studentsData.length - 1 === index;

  const handleOpenDetails = async () => {
    const studentId = item?.studentId ?? item?.StudentId ?? item?.id ?? null;
    if (!studentId || !token) {
      dispatch(setStudentDetail(item));
      navigation.navigate('DriverStudentDetail');
      return;
    }

    setDetailsLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const endpoint = `${baseUrl}/driver/students/${studentId}/details`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        showErrorToast('Error', errorText || 'Failed to fetch student details');
        return;
      }

      const payload = await response.json().catch(() => null);
      const data = payload?.data ?? {};
      const mapped = {
        studentId: data?.studentId ?? studentId,
        name: data?.name ?? item?.name ?? 'Student',
        image: item?.image,
        grade: data?.grade ?? '--',
        school_name: data?.schoolName ?? '--',
        emergency_contact: data?.emergencyContact ?? '--',
        transportation_preference: data?.transportationPreference ?? '--',
        medical_details: data?.medicalDetails ?? '--',
        route: data?.route ?? null,
        pickupLocation: data?.pickupLocation ?? null,
        dropoffLocation: data?.dropoffLocation ?? null,
        guardians: [
          {
            name: data?.guardian1?.name ?? '--',
            relation: data?.guardian1?.relation ?? '--',
            phone_number: data?.guardian1?.phone ?? '--',
          },
          {
            name: data?.guardian2?.name ?? '--',
            relation: data?.guardian2?.relation ?? '--',
            phone_number: data?.guardian2?.phone ?? '--',
          },
        ],
      };
      dispatch(setStudentDetail(mapped));
      navigation.navigate('DriverStudentDetail');
    } catch (e) {
      showErrorToast('Error', 'Network error while fetching student details');
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    if (item?.attendanceStatus === 'present' || item?.attendanceStatus === 'absent') {
      setStatus(item.attendanceStatus);
    }
  }, [item?.attendanceStatus]);

  return (
    <View
      style={[
        styles.container,
        position === 'row' ? styles.rowContainer : styles.columnContainer,
      ]}>
      <View
        style={
          position === 'row' ? styles.imgContainer : styles.columnImgContainer
        }>
        <Image style={styles.img} source={item?.image} />
        {status === 'present' && (
          <View style={[styles.overlay, { backgroundColor: 'rgba(34, 139, 34, 0.4)' }]}>
            <AppButton disabled={true} title="Present" style={styles.overlayBtn} titleStyle={styles.presentText} />
          </View>
        )}
        
        {status === 'absent' && (
          <View style={[styles.overlay, { backgroundColor: 'rgba(255, 0, 0, 0.4)' }]}>
            <AppButton disabled={true} title="Absent" style={styles.overlayBtn} titleStyle={styles.absentText} />
          </View>
        )}
      </View>

      <View style={position === 'row' ? { height: hp(18), gap: 8, paddingTop: hp(0.5) } : { marginLeft: hp(1) }}>
        <View style={position === 'row' ? AppStyles.alignJustifyCenter : { bottom: 10 }}>
          <Text style={[AppStyles.titleHead, { fontSize: size.md }]}>
            {position === 'row' ? truncateString(item?.name, 12) : truncateString(item?.name, 20)}
          </Text>
          <Text style={[AppStyles.whiteSubTitle, { color: AppColors.dimGray }]}>{item?.age} years</Text>
        </View>

        <View style={position === 'row' ? styles.btnContainer : styles.columnBtnContainer}>
          <TouchableOpacity
            onPress={() => {
              setStatus('present');
              const studentId = item?.studentId ?? item?.StudentId ?? item?.id;
              if (studentId != null) onAttendanceChange?.(studentId, 'present');
            }}
            style={[styles.statusButton, { backgroundColor: AppColors.green }]}>
            <GlobalIcon library='FontAwesome' name='check' size={24} color={AppColors.white}/>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setStatus('absent');
              const studentId = item?.studentId ?? item?.StudentId ?? item?.id;
              if (studentId != null) onAttendanceChange?.(studentId, 'absent');
            }}
            style={[styles.statusButton, { backgroundColor: AppColors.red }]}>
          <GlobalIcon library='Entypo' name='cross' size={30} color={AppColors.white}/>
          </TouchableOpacity>
        </View>

        {/* Details Button */}
        <AppButton
          title={detailsLoading ? 'Loading...' : 'Details'}
          style={position === 'row' ? styles.detailBtn : { ...styles.detailColumnBtn }}
          titleStyle={styles.detailTitle}
          loading={detailsLoading}
          onPress={handleOpenDetails}
        />
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
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderRadius: 8,
  },
  overlayBtn: {
    backgroundColor: AppColors.white,
    borderRadius: 50,
    borderWidth: 1.5,
    height: hp(3.5),
    bottom: hp(0.5),
    width: hp(9),
  },
  presentText: {
    color: AppColors.green,
    fontSize: size.sl,
    fontFamily: AppFonts.NunitoSansBold,
  },
  absentText: {
    color: AppColors.red,
    fontSize: size.sl,
    fontFamily: AppFonts.NunitoSansBold,
  },
  btnContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(1),
    gap: 3
  },
  columnBtnContainer: {
    width: '80%',
    top: hp(2),
    flexDirection: 'row',
    gap: 5,
  },
  statusButton: {
    width: '50%',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  detailBtn: {
    width: '100%',
    height: hp(4),
    borderRadius: 5,
    backgroundColor: AppColors.transparent,
    borderWidth: 1,
    borderColor: AppColors.dimGray,
    marginTop: 8,
  },
  detailColumnBtn: {
    width: '82%',
    height: hp(4),
    borderRadius: 5,
    backgroundColor: AppColors.transparent,
    borderWidth: 1,
    borderColor: AppColors.dimGray,
    marginTop: hp(3)
  },
  detailTitle: {
    width: '100%',
    textAlign: 'center',
    fontSize: fontSize(14),
    color: AppColors.black,
  },
});
