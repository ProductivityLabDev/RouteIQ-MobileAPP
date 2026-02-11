import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import AppHeader from '../../components/AppHeader';
import AppLayout from '../../layout/AppLayout';
import {AppColors} from '../../utils/color';
import AppStyles from '../../styles/AppStyles';
import {size} from '../../utils/responsiveFonts';
import {hp} from '../../utils/constants';
import AppInput from '../../components/AppInput';
import GlobalIcon from '../../components/GlobalIcon';
import GridIcon from '../../assets/svgs/GridIcon';
import StudentCard from '../../components/StudentCard';
import {studentsData} from '../../utils/DummyData';
import {useAppSelector} from '../../store/hooks';
import {getApiBaseUrl} from '../../utils/apiConfig';

const DriverStudentsScreen = () => {
  // const isFocused = useIsFocused();
  const [grid, setGrid] = useState('row');
  const numColumns = grid === 'row' ? 2 : 1;
  const token = useAppSelector(state => state.userSlices.token);
  const routesByDate = useAppSelector(state => (state as any).driverSlices.routesByDate);
  const activeRouteId = useAppSelector(state => (state as any).driverSlices.activeRouteId);
  const tokenRouteId = useAppSelector(state => (state as any).userSlices.routeId);
  const fallbackRouteIdFromRoutesByDate = (() => {
    const morning = Array.isArray(routesByDate?.morning) ? routesByDate.morning : [];
    const evening = Array.isArray(routesByDate?.evening) ? routesByDate.evening : [];
    const allRoutes = [...morning, ...evening];
    if (allRoutes.length === 0) return null;

    // Prefer route having highest student load so summary aligns with visible student list.
    const sorted = [...allRoutes].sort(
      (a: any, b: any) => Number(b?.TotalStudents ?? 0) - Number(a?.TotalStudents ?? 0),
    );
    const bestRoute = sorted[0];
    return bestRoute?.RouteId ?? bestRoute?.routeId ?? null;
  })();
  const effectiveRouteId =
    activeRouteId ?? tokenRouteId ?? fallbackRouteIdFromRoutesByDate;
  const [studentsOnBusCount, setStudentsOnBusCount] = useState<number>(0);
  const [totalStudentsCount, setTotalStudentsCount] = useState<number>(0);
  const [onBoardStudents, setOnBoardStudents] = useState<any[]>([]);
  const markedAttendanceRef = useRef<Set<string>>(new Set());

  const markAttendance = useCallback(
    async (
      routeId: number | string,
      studentId: number | string,
      action: 'pickup' | 'dropoff',
    ) => {
      if (!token) return;
      const requestKey = `${routeId}_${studentId}_${action}`;
      if (markedAttendanceRef.current.has(requestKey)) return;

      try {
        const baseUrl = getApiBaseUrl();
        const endpoint = `${baseUrl}/driver/attendance/mark`;
        const body = {
          routeId: Number(routeId),
          studentId: Number(studentId),
          action,
        };
        console.log('📡 POST attendance mark URL:', endpoint);
        console.log('📤 POST attendance mark body:', body);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          body: JSON.stringify(body),
        });

        const responseText = await response.text().catch(() => '');
        if (!response.ok) {
          console.warn(
            '❌ POST attendance mark failed:',
            response.status,
            responseText,
          );
          return;
        }

        let parsed: any = null;
        try {
          parsed = responseText ? JSON.parse(responseText) : null;
        } catch (e) {
          parsed = responseText;
        }
        console.log('✅ POST attendance mark success:', parsed);
        markedAttendanceRef.current.add(requestKey);
      } catch (e) {
        console.warn('❌ POST attendance mark network error:', e);
      }
    },
    [token],
  );

  const handleManualAttendanceChange = useCallback(
    async (studentId: number | string, nextStatus: 'present' | 'absent') => {
      if (!studentId) return;

      setOnBoardStudents(prev => {
        const next = prev.map((student: any) =>
          String(student?.studentId) === String(studentId)
            ? {...student, attendanceStatus: nextStatus}
            : student,
        );
        const presentCount = next.filter(
          (student: any) => student?.attendanceStatus === 'present',
        ).length;
        setStudentsOnBusCount(presentCount);
        return next;
      });

      if (!effectiveRouteId) return;
      if (nextStatus === 'present') {
        await markAttendance(effectiveRouteId, studentId, 'pickup');
      } else {
        await markAttendance(effectiveRouteId, studentId, 'dropoff');
      }
    },
    [effectiveRouteId, markAttendance],
  );

  // useEffect(() => {
  //   setGrid('row')
  // }, [isFocused])
  useEffect(() => {
    const fetchOnBoardSummary = async () => {
      console.log('🧭 Onboard summary precheck:', {
        hasToken: !!token,
        activeRouteId,
        tokenRouteId,
        fallbackRouteIdFromRoutesByDate,
        effectiveRouteId,
      });
      if (!token || !effectiveRouteId) {
        console.warn('⚠️ Onboard summary skipped: token/routeId missing');
        return;
      }
      try {
        const baseUrl = getApiBaseUrl();
        const currentType = new Date().getHours() < 12 ? 'AM' : 'PM';
        const endpoint = `${baseUrl}/tracking/routes/${effectiveRouteId}/students/onboard?type=${currentType}`;
        console.log('📡 GET onboard summary URL:', endpoint);
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        console.log('📡 GET onboard summary status:', response.status);
        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          console.warn('❌ GET onboard summary failed:', errorText);
          return;
        }
        const data = await response.json().catch(() => null);
        console.log('✅ GET onboard summary response:', data);
        console.log(
          '✅ GET onboard students list:',
          JSON.stringify(data?.data?.studentsOnBoard ?? [], null, 2),
        );
        const summary = data?.data ?? {};
        setStudentsOnBusCount(Number(summary?.onBoardCount ?? 0));
        setTotalStudentsCount(Number(summary?.totalStudents ?? 0));
        const apiStudents = Array.isArray(summary?.studentsOnBoard)
          ? summary.studentsOnBoard
          : [];
        const mappedStudents = apiStudents.map((student: any, idx: number) => ({
          studentId: student?.studentId,
          name: student?.studentName ?? `Student ${idx + 1}`,
          age: '--',
          image: studentsData[idx % studentsData.length]?.image,
          pickupLocation: student?.pickupLocation ?? '',
          pickupTime: student?.pickupTime ?? null,
          estimatedDropoff: student?.estimatedDropoff ?? null,
          status: student?.status ?? '',
          attendanceStatus:
            String(student?.status ?? '').toLowerCase() === 'on board'
              ? 'present'
              : null,
        }));
        setOnBoardStudents(mappedStudents);

        await Promise.all(
          mappedStudents.map((student: any) => {
            if (!student?.studentId) return Promise.resolve();
            const rawStatus = String(student?.status ?? '').toLowerCase();
            let action: 'pickup' | 'dropoff' | null = null;
            if (rawStatus === 'on board' || rawStatus === 'picked up') {
              action = 'pickup';
            } else if (rawStatus === 'dropped off') {
              action = 'dropoff';
            }
            if (!action) {
              if (__DEV__) {
                console.log(
                  'ℹ️ attendance mark skipped for status:',
                  student?.status,
                  'studentId:',
                  student?.studentId,
                );
              }
              return Promise.resolve();
            }
            return markAttendance(
              effectiveRouteId,
              student.studentId,
              action,
            );
          }),
        );
      } catch (e) {
        console.warn('❌ GET onboard summary network error:', e);
        // Keep UI stable on failure
      }
    };

    fetchOnBoardSummary();
  }, [
    token,
    effectiveRouteId,
    activeRouteId,
    tokenRouteId,
    fallbackRouteIdFromRoutesByDate,
    markAttendance,
  ]);

  return (
    <AppLayout
      statusbackgroundColor={AppColors.red}
      style={{backgroundColor: AppColors.driverScreen}}>
      <AppHeader
        role="Driver"
        title="Students"
        enableBack={false}
        profile_image={true}
        rightIcon={true}
      />
      <View style={AppStyles.driverContainer}>
        <View style={[styles.studentContainer, AppStyles.boxShadow]}>
          <View style={[AppStyles.rowBetween, styles.titleContainer]}>
            <View style={AppStyles.center}>
              <Text style={[AppStyles.whiteSubTitle, {color: AppColors.black}]}>
                Students On Bus:
              </Text>
              <Text style={[AppStyles.titleHead, {fontSize: size.lg}]}>
                {`${studentsOnBusCount} out of ${totalStudentsCount}`}
              </Text>
            </View>
            <View style={AppStyles.center}>
              <Text style={[AppStyles.whiteSubTitle, {color: AppColors.black}]}>
                Total Students:
              </Text>
              <Text style={[AppStyles.titleHead, {fontSize: size.lg}]}>
                {totalStudentsCount}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={[
            AppStyles.rowBetween,
            {marginTop: hp(2), paddingBottom: hp(1)},
          ]}>
          <View style={{width: '83%'}}>
            <AppInput
              placeholder="Search..."
              container={[AppStyles.boxShadow, {borderWidth: 0}]}
              inputStyle={{paddingLeft: hp(1)}}
              containerStyle={{marginBottom: 0}}
              rightInnerIcon={
                <GlobalIcon
                  library="Fontisto"
                  name="search"
                  color={AppColors.black}
                  size={hp(2.5)}
                />
              }
            />
          </View>
          <TouchableOpacity
            onPress={() => (grid == 'row' ? setGrid('column') : setGrid('row'))}
            style={[AppStyles.boxShadow, styles.gridIcon]}>
            {grid == 'row' ? (
              <GridIcon />
            ) : (
              <GlobalIcon
                library="Ionicons"
                name="grid-sharp"
                color={AppColors.dimGray}
                size={hp(2.5)}
              />
            )}
          </TouchableOpacity>
        </View>

        <View style={[AppStyles.rowBetween, AppStyles.rowBetween]}>
          <FlatList
            key={numColumns}
            numColumns={numColumns}
            data={onBoardStudents.length > 0 ? onBoardStudents : studentsData}
            renderItem={({item, index}) => (
              <StudentCard
                position={grid}
                item={item}
                index={index}
                onAttendanceChange={handleManualAttendanceChange}
              />
            )}
            columnWrapperStyle={numColumns > 1 ? styles.row : null}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: hp(20)}}
          />
        </View>
      </View>
    </AppLayout>
  );
};

export default DriverStudentsScreen;

const styles = StyleSheet.create({
  studentContainer: {
    backgroundColor: AppColors.red,
    paddingTop: hp(0.3),
    borderRadius: 12,
  },
  titleContainer: {
    backgroundColor: AppColors.white,
    paddingHorizontal: hp(3),
    paddingVertical: hp(1.5),
    borderRadius: 10,
  },
  gridIcon: {
    backgroundColor: AppColors.white,
    borderRadius: 10,
    height: hp(5.7),
    width: hp(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flex: 1,
    justifyContent: 'space-between',
  },
});
