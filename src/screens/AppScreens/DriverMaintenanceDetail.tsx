import React, {useCallback, useEffect, useMemo, useState} from 'react';
import AppHeader from '../../components/AppHeader';
import AppLayout from '../../layout/AppLayout';
import {AppColors} from '../../utils/color';
import {useAppSelector} from '../../store/hooks';
import AppStyles from '../../styles/AppStyles';
import {
  FlatList,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AppInput from '../../components/AppInput';
import {hp, screenHeight} from '../../utils/constants';
import AppFonts from '../../utils/appFonts';
import {size} from '../../utils/responsiveFonts';
import {Image} from 'react-native';
import CleaningCard from '../../components/CleaningCard';
import AnimatedDriverMapView from '../../components/AnimatedDriverMapView';
import CleaningCollapsableCard from '../../components/CleaningCollapsableCard';
import {getApiBaseUrl} from '../../utils/apiConfig';
import AppButton from '../../components/AppButton';
import {showErrorToast, showSuccessToast} from '../../utils/toast';

const DriverMaintenanceDetail = () => {
  const maintenanceDetail = useAppSelector(
    state => state.driverSlices.maintenanceDetail,
  );
  const token = useAppSelector(state => state.userSlices.token);
  const tokenVehicleId = useAppSelector(
    state => (state as any).userSlices.vehicleId,
  );
  const routesByDate = useAppSelector(state => (state as any).driverSlices.routesByDate);
  const [mileage, setMileage] = useState('');
  const [cleaningCategories, setCleaningCategories] = useState<any[]>([]);
  const [selectedCleaningItemIds, setSelectedCleaningItemIds] = useState<number[]>([]);
  const [cleaningNotes, setCleaningNotes] = useState('');
  const [loadingChecklist, setLoadingChecklist] = useState(false);
  const [submittingChecklist, setSubmittingChecklist] = useState(false);

  const effectiveVehicleId = useMemo(() => {
    if (tokenVehicleId != null) return Number(tokenVehicleId);
    const morning = Array.isArray(routesByDate?.morning) ? routesByDate.morning : [];
    const evening = Array.isArray(routesByDate?.evening) ? routesByDate.evening : [];
    const firstRoute = morning[0] ?? evening[0] ?? null;
    const id = firstRoute?.VehicleId ?? firstRoute?.vehicleId ?? null;
    return id != null ? Number(id) : null;
  }, [tokenVehicleId, routesByDate]);

  const cleaningCards = useMemo(() => {
    return cleaningCategories.map((category: any) => ({
      title: String(category?.categoryName ?? ''),
      options: Array.isArray(category?.items) ? category.items : [],
    }));
  }, [cleaningCategories]);

  const handleToggleCleaningItem = useCallback((itemId: number) => {
    setSelectedCleaningItemIds(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId],
    );
  }, []);

  useEffect(() => {
    const fetchCleaningChecklist = async () => {
      if (maintenanceDetail !== 'Cleaning') return;
      if (!token) return;
      setLoadingChecklist(true);
      try {
        const baseUrl = getApiBaseUrl();
        const endpoint = `${baseUrl}/driver/cleaning/checklist`;
        console.log('📡 GET cleaning checklist URL:', endpoint);
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        console.log('📡 GET cleaning checklist status:', response.status);
        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          console.warn('❌ GET cleaning checklist failed:', errorText);
          return;
        }
        const data = await response.json().catch(() => null);
        console.log('✅ GET cleaning checklist response:', data);
        const list = Array.isArray(data?.data) ? data.data : [];
        setCleaningCategories(list);
      } catch (e) {
        console.warn('❌ GET cleaning checklist network error:', e);
      } finally {
        setLoadingChecklist(false);
      }
    };
    fetchCleaningChecklist();
  }, [maintenanceDetail, token]);

  const submitCleaningChecklist = useCallback(async () => {
    if (!token) {
      showErrorToast('Error', 'Not authenticated');
      return;
    }
    if (!effectiveVehicleId) {
      showErrorToast('Required', 'Vehicle not found');
      return;
    }
    if (selectedCleaningItemIds.length === 0) {
      showErrorToast('Required', 'Please select at least one checklist item');
      return;
    }
    setSubmittingChecklist(true);
    try {
      const baseUrl = getApiBaseUrl();
      const endpoint = `${baseUrl}/driver/cleaning/submit`;
      const body = {
        vehicleId: Number(effectiveVehicleId),
        completedItemIds: selectedCleaningItemIds,
        notes: cleaningNotes.trim() || 'Cleaning checklist submitted',
      };
      console.log('📡 POST cleaning submit URL:', endpoint);
      console.log('📤 POST cleaning submit body:', body);
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
        console.warn('❌ POST cleaning submit failed:', response.status, responseText);
        showErrorToast('Submit Failed', responseText || 'Could not submit cleaning report');
        return;
      }
      console.log('✅ POST cleaning submit success:', responseText);
      showSuccessToast('Success', 'Cleaning report submitted');
      setSelectedCleaningItemIds([]);
      setCleaningNotes('');
    } catch (e) {
      console.warn('❌ POST cleaning submit network error:', e);
      showErrorToast('Error', 'Network error while submitting cleaning report');
    } finally {
      setSubmittingChecklist(false);
    }
  }, [token, effectiveVehicleId, selectedCleaningItemIds, cleaningNotes]);

  const fuelItem = () => {
    return (
      <>
        <AppInput
          label="Enter Current Mileage"
          value={mileage}
          placeholder="e.g 201569"
          onChangeText={(text: string) => setMileage(text)}
          keyboardType="number-pad"
          containerStyle={styles.containerStyle}
          inputStyle={styles.inputStyle}
          labelStyle={styles.labelStyle}
        />
        <View style={[styles.containerStyle, {marginTop: hp(1)}]}>
          <Text style={[AppStyles.titleHead, {fontSize: size.lg}]}>
            Fuel Card
          </Text>
          <Image
            style={styles.image}
            source={require('../../assets/images/Credit-Card-Design.png')}
          />
        </View>
      </>
    );
  };

  return (
    <AppLayout
      statusbackgroundColor={AppColors.red}
      style={{backgroundColor: AppColors.driverScreen}}
      alarmIcon={true}>
      <AppHeader
        role="Driver"
        title={maintenanceDetail || ''}
        enableBack={true}
        rightIcon={true}
      />
      <ScrollView>
        <View style={[AppStyles.driverContainer, {paddingTop: hp(4)}]}>
          {maintenanceDetail == 'Fuel' && fuelItem()}
          {/* {maintenanceDetail == 'Cleaning' && <CleaningCard />} */}
          {maintenanceDetail == 'Cleaning' && (
            <>
              {loadingChecklist ? (
                <Text style={[AppStyles.title, {marginBottom: hp(2)}]}>
                  Loading checklist...
                </Text>
              ) : null}
              <FlatList
                data={cleaningCards}
                keyExtractor={(item, idx) => `${item?.title}_${idx}`}
                renderItem={({item}) => (
                  <CleaningCollapsableCard
                    item={item}
                    checkedItemIds={selectedCleaningItemIds}
                    onToggleItem={handleToggleCleaningItem}
                  />
                )}
                contentContainerStyle={{gap: hp(2)}}
              />
              <AppInput
                label="Notes"
                value={cleaningNotes}
                placeholder="Interior cleaned, tyre wash pending"
                onChangeText={(text: string) => setCleaningNotes(text)}
                containerStyle={[styles.containerStyle, {marginTop: hp(2)}]}
                inputStyle={styles.inputStyle}
                labelStyle={styles.labelStyle}
              />
              <AppButton
                title={submittingChecklist ? 'Submitting...' : 'Submit'}
                loading={submittingChecklist}
                onPress={submitCleaningChecklist}
                style={{width: '100%', marginTop: hp(2)}}
              />
            </>
          )}
          {maintenanceDetail == 'Mileage Record' && (
            <>
            <CleaningCard mileage={true} />
            <View style={{marginTop:hp(2)}}>
            <CleaningCard mileage={true} />
            </View>
            <View style={{marginTop:hp(2)}}>
            <CleaningCard mileage={true} />
            </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* {maintenanceDetail == 'Cleaning' && <AnimatedDriverMapView />} */}
    </AppLayout>
  );
};

export default DriverMaintenanceDetail;

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: AppColors.white,
    padding: hp(2),
    borderRadius: 16,
  },
  inputStyle: {
    height: hp(5.5),
  },
  labelStyle: {
    fontFamily: AppFonts.NunitoSansSemiBold,
  },
  image: {
    height: hp(30),
    width: '100%',
    resizeMode: 'contain',
    marginTop: hp(1),
  },
});
