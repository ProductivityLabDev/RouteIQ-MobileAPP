import React, {useEffect, useMemo, useState} from 'react';
import {FlatList, Image, StyleSheet, Text, View} from 'react-native';
import CircleCheckBoxIcon from '../../assets/svgs/CircleCheckBoxIcon';
import CircleUnCheckBoxIcon from '../../assets/svgs/CircleUnCheckBoxIcon';
import SquareCheckBoxIcon from '../../assets/svgs/SquareCheckBoxIcon';
import AppButton from '../../components/AppButton';
import AppCheckBox from '../../components/AppCheckBox';
import AppHeader from '../../components/AppHeader';
import AppSwitchButton from '../../components/AppSwitchButton';
import AppLayout from '../../layout/AppLayout';
import AppStyles from '../../styles/AppStyles';
import AppFonts from '../../utils/appFonts';
import {AppColors} from '../../utils/color';
import {hp} from '../../utils/constants';
import {
  handleInspectionButtonTitle,
} from '../../utils/functions';
import {front_inspection} from '../../utils/objects';
import {size} from '../../utils/responsiveFonts';
import {useNavigation} from '@react-navigation/native';
import SquareCheckedIcon from '../../assets/svgs/SquareCheckedIcon';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {setShowStartMileAgeSheet} from '../../store/user/userSlices';
import {getApiBaseUrl} from '../../utils/apiConfig';
import {showErrorToast, showSuccessToast} from '../../utils/toast';

const DriverInspection = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const token = useAppSelector(state => state.userSlices.token);
  const tokenVehicleId = useAppSelector(
    state => (state as any).userSlices.vehicleId,
  );
  const routesByDate = useAppSelector(state => (state as any).driverSlices.routesByDate);
  const [index, setIndex] = useState(0);
  const [isSwitchOn, setIsSwitchOn] = useState(true);
  const [inspectionItems, setInspectionItems] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedIssueIds, setSelectedIssueIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const categories = useMemo(() => {
    if (Array.isArray(inspectionItems) && inspectionItems.length > 0) {
      return inspectionItems;
    }
    return front_inspection.map((name, idx) => ({
      categoryId: idx + 1,
      categoryName: name,
      issues: [],
    }));
  }, [inspectionItems]);

  const selectedCategory = useMemo(
    () => categories.find((item: any) => Number(item?.categoryId) === Number(selectedCategoryId)),
    [categories, selectedCategoryId],
  );
  const selectedCategoryName = selectedCategory?.categoryName ?? 'Category';
  const selectedCategoryIssues = Array.isArray(selectedCategory?.issues)
    ? selectedCategory.issues
    : [];
  const effectiveVehicleId = useMemo(() => {
    if (tokenVehicleId != null) return Number(tokenVehicleId);
    const morning = Array.isArray(routesByDate?.morning) ? routesByDate.morning : [];
    const evening = Array.isArray(routesByDate?.evening) ? routesByDate.evening : [];
    const firstRoute = morning[0] ?? evening[0] ?? null;
    const id = firstRoute?.VehicleId ?? firstRoute?.vehicleId ?? null;
    return id != null ? Number(id) : null;
  }, [tokenVehicleId, routesByDate]);

  useEffect(() => {
    const fetchInspectionItems = async () => {
      if (!token) return;
      try {
        const baseUrl = getApiBaseUrl();
        const endpoint = `${baseUrl}/driver/inspection/items`;
        console.log('📡 GET inspection items URL:', endpoint);
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        console.log('📡 GET inspection items status:', response.status);
        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          console.warn('❌ GET inspection items failed:', errorText);
          return;
        }
        const data = await response.json().catch(() => null);
        console.log('✅ GET inspection items response:', data);
        const list = Array.isArray(data?.data) ? data.data : [];
        setInspectionItems(list);
      } catch (e) {
        console.warn('❌ GET inspection items network error:', e);
      }
    };
    fetchInspectionItems();
  }, [token]);

  const handleToggle = (newValue: boolean) => {
    setIsSwitchOn(newValue);
  };

  const submitInspectionReport = async () => {
    if (!token) {
      showErrorToast('Error', 'Not authenticated');
      return;
    }
    if (!selectedCategoryId) {
      showErrorToast('Required', 'Please select category first');
      return;
    }
    if (selectedIssueIds.length === 0) {
      showErrorToast('Required', 'Please select at least one issue');
      return;
    }
    if (!effectiveVehicleId) {
      showErrorToast('Required', 'Vehicle not found. Please try again.');
      return;
    }
    setSubmitting(true);
    try {
      const baseUrl = getApiBaseUrl();
      const endpoint = `${baseUrl}/driver/inspection`;
      const body = {
        vehicleId: Number(effectiveVehicleId),
        inspectionType: 'Pre-Trip',
        selectedIssueIds: selectedIssueIds,
        notes: `Category: ${selectedCategoryName}`,
      };
      console.log('📡 POST inspection URL:', endpoint);
      console.log('📤 POST inspection body:', body);
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
        console.warn('❌ POST inspection failed:', response.status, responseText);
        showErrorToast('Submit Failed', responseText || 'Could not submit inspection');
        return;
      }
      let parsed: any = null;
      try {
        parsed = responseText ? JSON.parse(responseText) : null;
      } catch (e) {
        parsed = responseText;
      }
      console.log('✅ POST inspection success:', parsed);
      showSuccessToast('Success', 'Inspection submitted');
      const inspectionReportId =
        parsed?.inspectionReportId ??
        parsed?.InspectionId ??
        parsed?.data?.inspectionReportId ??
        parsed?.data?.inspectionId ??
        parsed?.data?.InspectionId ??
        null;
      navigation.navigate('DriverMapView', {
        inspectionReportId,
        inspectionSelectedIssueIds: selectedIssueIds,
        inspectionNotes: `Category: ${selectedCategoryName}`,
      });
      dispatch(setShowStartMileAgeSheet(true));
    } catch (e) {
      console.warn('❌ POST inspection network error:', e);
      showErrorToast('Error', 'Network error while submitting inspection');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout
      statusbackgroundColor={AppColors.red}
      style={{backgroundColor: AppColors.driverScreen}}>
      <AppHeader
        role="Driver"
        title="Inspections"
        enableBack={true}
        rightIcon={false}
        backFunctionEnable={index == 0 ? false : true}
        handleBack={() => setIndex(index - 1)}
      />
      <View style={[AppStyles.driverContainer, {paddingHorizontal: 0}]}>
        <View style={AppStyles.flexBetween}>
          <View style={AppStyles.flex}>
            {index == 0 && (
              <View
                style={[
                  AppStyles.flex,
                  AppStyles.alignJustifyCenter,
                  styles.container,
                ]}>
                <Image
                  style={styles.image}
                  source={require('../../assets/images/scan_image.png')}
                />
              </View>
            )}
            {index == 1 && (
              <View style={styles.container}>
                <Text style={[AppStyles.titleHead, {fontSize: size.slg}]}>
                  Move to FRONT SIDE
                </Text>
                <FlatList
                  data={categories}
                  keyExtractor={(item: any, idx) =>
                    String(item?.categoryId ?? idx)
                  }
                  renderItem={({item}) => {
                    return (
                      <View style={{marginTop: hp(2)}}>
                        <AppCheckBox
                          isChecked={
                            Number(selectedCategoryId) ===
                            Number(item?.categoryId)
                          }
                          onClick={() => {
                            setSelectedCategoryId(Number(item?.categoryId));
                            setSelectedIssueIds([]);
                          }}
                          rightText={String(item?.categoryName ?? '')}
                          checkedImage={<CircleCheckBoxIcon />}
                          unCheckedImage={<CircleUnCheckBoxIcon />}
                        />
                      </View>
                    );
                  }}
                />
              </View>
            )}
            {index == 2 && (
              <View>
                <View style={[styles.container, {gap: 5}]}>
                  <Text style={[AppStyles.titleHead, {fontSize: size.slg}]}>
                    {selectedCategoryName}
                  </Text>
                  <Text
                    style={[
                      AppStyles.title,
                      {fontFamily: AppFonts.NunitoSansMedium},
                    ]}>
                    Choose all issues that are present
                  </Text>
                </View>
                <FlatList
                  data={selectedCategoryIssues}
                  keyExtractor={(item: any, idx) => String(item?.issueId ?? idx)}
                  ListEmptyComponent={
                    <View style={[styles.lightsContainer, {marginTop: hp(5)}]}>
                      <Text style={AppStyles.subHeading}>
                        No issues found for selected category.
                      </Text>
                    </View>
                  }
                  renderItem={({item}) => {
                    const issueId = Number(item?.issueId);
                    const checked = selectedIssueIds.includes(issueId);
                    return (
                      <View style={[styles.lightsContainer, {marginTop: hp(2)}]}>
                        <AppCheckBox
                          isChecked={checked}
                          onClick={() =>
                            setSelectedIssueIds(prev =>
                              prev.includes(issueId)
                                ? prev.filter(id => id !== issueId)
                                : [...prev, issueId],
                            )
                          }
                          rightText={String(item?.issueName ?? '')}
                          checkedImage={<SquareCheckedIcon />}
                          unCheckedImage={<SquareCheckBoxIcon />}
                        />
                      </View>
                    );
                  }}
                />
              </View>
            )}
            {index == 3 && (
              <View>
                <View style={{gap: 5, marginTop: hp(2)}}>
                  <Text
                    style={[
                      AppStyles.titleHead,
                      {fontSize: size.slg, paddingHorizontal: hp(2)},
                    ]}>
                    Inspection results
                  </Text>
                  <View style={[AppStyles.rowBetween, styles.reportContainer]}>
                    <Text style={AppStyles.subHeading}>Show full report</Text>
                    <AppSwitchButton
                      isOn={isSwitchOn}
                      onToggle={handleToggle}
                      onTitle=""
                      switchBackgroundColor={
                        isSwitchOn ? AppColors.red : '#e3e0e8'
                      }
                      switchBackgroundStyle={styles.switchStyle}
                      outputRange={[hp(0.2), hp(2.4)]}
                      circleStyle={styles.circleStyle}
                    />
                  </View>
                  <Text
                    style={[
                      AppStyles.subHeading,
                      {paddingHorizontal: hp(2), paddingVertical: hp(2)},
                    ]}>
                    {selectedIssueIds.length > 0
                      ? `You selected ${selectedIssueIds.length} issue(s) in ${selectedCategoryName}.`
                      : 'You didn’t report any issues with the vehicle.'}
                  </Text>
                </View>
              </View>
            )}
          </View>
          <View style={{paddingHorizontal: hp(2)}}>
            {index >= 1 && (
              <View
                style={[AppStyles.rowCenter, {gap: 10, marginBottom: hp(2)}]}>
                <View
                  style={[
                    styles.slider,
                    {
                      backgroundColor:
                        index == 1 || index == 2 || index == 3
                          ? AppColors.red
                          : AppColors.dimGray,
                    },
                  ]}></View>
                <View
                  style={[
                    styles.slider,
                    {
                      backgroundColor:
                        index == 2 || index == 3
                          ? AppColors.red
                          : AppColors.dimGray,
                    },
                  ]}></View>
                <View
                  style={[
                    styles.slider,
                    {
                      backgroundColor:
                        index == 3 ? AppColors.red : AppColors.dimGray,
                    },
                  ]}></View>
              </View>
            )}
            <AppButton
              title={
                index === 1 && selectedCategoryName
                  ? `Inspect ${selectedCategoryName}`
                  : handleInspectionButtonTitle(index)
              }
              style={{width: '100%'}}
              loading={submitting}
              onPress={() => {
                if (index <= 2) {
                  if (index === 1 && !selectedCategoryId) {
                    showErrorToast('Required', 'Please select category');
                    return;
                  }
                  setIndex(index + 1);
                } else {
                  submitInspectionReport();
                }
              }}
            />
          </View>
        </View>
      </View>
    </AppLayout>
  );
};

export default DriverInspection;

const styles = StyleSheet.create({
  image: {height: hp(50), width: '100%', resizeMode: 'contain'},
  slider: {
    height: hp(1),
    width: hp(6),
    backgroundColor: AppColors.red,
  },
  lightsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: AppColors.dimGray,
    paddingBottom: hp(2),
    marginTop: hp(2),
    paddingHorizontal: hp(4),
  },
  container: {
    paddingHorizontal: hp(4),
    paddingTop: hp(2),
  },
  switchStyle: {
    backgroundColor: AppColors.red,
    width: hp(5.5),
    height: hp(3.5),
  },
  circleStyle: {
    width: hp(2.8),
    height: hp(2.8),
  },
  reportContainer: {
    borderBottomWidth: 1,
    borderBottomColor: AppColors.dimGray,
    paddingBottom: hp(2),
    paddingHorizontal: hp(2),
  },
});
