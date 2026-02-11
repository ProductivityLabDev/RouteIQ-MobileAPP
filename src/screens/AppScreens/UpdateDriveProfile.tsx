import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import AppLayout from '../../layout/AppLayout';
import AppHeader from '../../components/AppHeader';
import {AppColors} from '../../utils/color';
import AppStyles from '../../styles/AppStyles';
import {hp} from '../../utils/constants';
import AppButton from '../../components/AppButton';
import AppInput from '../../components/AppInput';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Controller, useForm} from 'react-hook-form';
import {useAppSelector} from '../../store/hooks';
import {showSuccessToast, showErrorToast} from '../../utils/toast';
import {getApiBaseUrl} from '../../utils/apiConfig';

const UpdateDriveProfile = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const driverDetails = route?.params?.driverDetails;
  const token = useAppSelector(state => state.userSlices.token);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [allCities, setAllCities] = useState<string[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [cityNameToId, setCityNameToId] = useState<Record<string, number>>({});
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [citySearch, setCitySearch] = useState('');
  const [cityPickerVisible, setCityPickerVisible] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: {errors},
  } = useForm({
    defaultValues: {
      email: '',
      phoneNumber: '',
      address: '',
      city: '',
      zipCode: '',
    },
  });

  useEffect(() => {
    // Prefill from API-backed details if provided
    const email = driverDetails?.Email ?? driverDetails?.email ?? '';
    const phoneNumber = driverDetails?.Phone ?? driverDetails?.phone ?? '';
    const address = driverDetails?.Address ?? driverDetails?.address ?? '';
    const city = driverDetails?.City ?? driverDetails?.city ?? '';
    const cityId =
      driverDetails?.CityId ??
      driverDetails?.cityId ??
      driverDetails?.cityID ??
      null;
    const zipCode = driverDetails?.ZipCode ?? driverDetails?.zipCode ?? '';

    setValue('email', email);
    setValue('phoneNumber', phoneNumber);
    setValue('address', address);
    setValue('city', city);
    setSelectedCityId(cityId != null ? Number(cityId) : null);
    setValue('zipCode', zipCode);
  }, [driverDetails, setValue]);

  useEffect(() => {
    if (!token) return;
    let mounted = true;

    const fetchCities = async () => {
      setCitiesLoading(true);
      try {
        const baseUrl = getApiBaseUrl();
        const response = await fetch(`${baseUrl}/driver/cities`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          if (__DEV__) {
            console.warn(
              '❌ GET /driver/cities failed:',
              response.status,
              errorText,
            );
          }
          return;
        }

        const data = await response.json().catch(() => null);
        const rawList = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : Array.isArray(data?.cities)
          ? data.cities
          : [];

        const parsed = rawList
          .map((item: any) => {
            if (typeof item === 'string') return {name: item.trim(), id: null};
            const name = String(
              item?.city ??
                item?.City ??
                item?.CityName ??
                item?.cityName ??
                item?.name ??
                item?.Name ??
                item?.label ??
                '',
            ).trim();
            const idRaw =
              item?.CityId ?? item?.cityId ?? item?.id ?? item?.Id ?? null;
            return {
              name,
              id: idRaw != null && !Number.isNaN(Number(idRaw)) ? Number(idRaw) : null,
            };
          })
          .filter((x: {name: string}) => x.name.length > 0);

        const map: Record<string, number> = {};
        const uniqueCities: string[] = [];
        parsed.forEach((x: {name: string; id: number | null}) => {
          if (!uniqueCities.includes(x.name)) uniqueCities.push(x.name);
          if (x.id != null && map[x.name] == null) map[x.name] = x.id;
        });
        if (!mounted) return;
        setCityNameToId(map);
        setAllCities(uniqueCities);
        setCitySuggestions(uniqueCities.slice(0, 10));
      } catch (e) {
        if (__DEV__) console.warn('❌ GET /driver/cities network error:', e);
      } finally {
        if (mounted) setCitiesLoading(false);
      }
    };

    fetchCities();
    return () => {
      mounted = false;
    };
  }, [token]);

  const handleCitySearch = (text: string) => {
    setCitySearch(text);
    const q = text.trim().toLowerCase();
    if (!q) {
      setCitySuggestions(allCities.slice(0, 10));
      return;
    }
    setCitySuggestions(
      allCities.filter(c => c.toLowerCase().includes(q)).slice(0, 10),
    );
  };

  const onSubmit = async (data: any) => {
    if (!token) {
      showErrorToast('Error', 'Not authenticated');
      return;
    }

    setIsSubmitting(true);
    try {
      const baseUrl = getApiBaseUrl();
      // Keep city as string (backend validation), send cityId separately when available.
      const body: Record<string, any> = {};
      if (data.email?.trim()) body.email = data.email.trim();
      if (data.phoneNumber?.trim()) body.phone = data.phoneNumber.trim(); // API field = "phone" (string)
      if (data.address?.trim()) body.address = data.address.trim();
      const matchedCityId =
        selectedCityId ??
        cityNameToId[data.city?.trim?.() ?? ''] ??
        null;
      if (data.city?.trim() && matchedCityId == null) {
        showErrorToast('City Required', 'Please select city from list');
        setIsSubmitting(false);
        return;
      }
      if (data.city?.trim()) body.city = data.city.trim();
      if (matchedCityId != null) body.cityId = Number(matchedCityId);
      if (data.zipCode?.trim()) body.zipCode = data.zipCode.trim();

      if (__DEV__) console.log('📡 PATCH /driver/profile body:', body);

      const response = await fetch(`${baseUrl}/driver/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        let errorBody: any = null;
        try {
          errorBody = errorText ? JSON.parse(errorText) : null;
        } catch (e) {
          errorBody = null;
        }
        const message =
          errorBody?.message || errorBody?.error || errorText || 'Profile update failed';
        showErrorToast('Update Failed', typeof message === 'string' ? message : JSON.stringify(message));
        return;
      }

      showSuccessToast('Updated', 'Profile updated successfully');
      navigation.goBack();
    } catch (err) {
      if (__DEV__) console.warn('Profile update error:', err);
      showErrorToast('Error', 'Network error while updating profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout
      statusbackgroundColor={AppColors.red}
      style={{backgroundColor: AppColors.white}}>
      <AppHeader
        role="Driver"
        title="Profile Info"
        enableBack={true}
        rightIcon={false}
      />
      <ScrollView
        contentContainerStyle={[
          AppStyles.driverContainer,
          AppStyles.flexBetween,
        ]}>
        <View>
          <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>Email</Text>
            <Controller
              name="email"
              control={control}
              render={({field: {onChange, value}}) => (
                <AppInput
                  value={value}
                  containerStyle={[AppStyles.halfWidth]}
                  container={styles.inputContainer}
                  inputStyle={styles.inputStyle}
                  multiline={true}
                  onChangeText={text => onChange(text)}
                  error={errors.email?.message}
                />
              )}
            />
          </View>
          <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>
              Phone Number
            </Text>
            <Controller
              name="phoneNumber"
              control={control}
              render={({field: {onChange, value}}) => (
                <AppInput
                  value={value}
                  placeholder='+923001234567'
                  containerStyle={AppStyles.halfWidth}
                  keyboardType="phone-pad"
                  container={[styles.inputContainer, {height: 40}]}
                  inputStyle={styles.inputStyle}
                  onChangeText={text => onChange(text)}
                  error={errors.phoneNumber?.message}
                />
              )}
            />
          </View>
          <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>Address</Text>
            <Controller
              name="address"
              control={control}
              render={({field: {onChange, value}}) => (
                <AppInput
                  value={value}
                  containerStyle={[AppStyles.halfWidth]}
                  container={styles.inputContainer}
                  inputStyle={styles.inputStyle}
                  multiline={true}
                  onChangeText={text => onChange(text)}
                  error={errors.address?.message}
                />
              )}
            />
          </View>
          <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>City</Text>
            <Controller
              name="city"
              control={control}
              render={({field: {onChange, value}}) => (
                <Pressable
                  style={[styles.inputContainer, styles.cityPickerInput]}
                  onPress={() => {
                    setCityPickerVisible(true);
                    setCitySearch('');
                    setCitySuggestions(allCities.slice(0, 10));
                  }}>
                  <Text
                    style={[
                      styles.inputStyle,
                      AppStyles.halfWidth,
                      !value ? styles.cityPlaceholder : null,
                    ]}
                    numberOfLines={1}>
                    {value || 'Select city'}
                  </Text>
                </Pressable>
              )}
            />
          </View>
          <View style={[AppStyles.rowBetween, {marginBottom: hp(2)}]}>
            <Text style={[AppStyles.title, AppStyles.halfWidth]}>Zip Code</Text>
            <Controller
              name="zipCode"
              control={control}
              render={({field: {onChange, value}}) => (
                <AppInput
                  value={value}
                  placeholder='54000'
                  containerStyle={AppStyles.halfWidth}
                  keyboardType="number-pad"
                  container={[styles.inputContainer, {height: 40}]}
                  inputStyle={styles.inputStyle}
                  onChangeText={text => onChange(text)}
                  error={errors.zipCode?.message}
                />
              )}
            />
          </View>
        </View>
        <View>
          <AppButton
            title={isSubmitting ? 'Updating...' : 'Update'}
            style={{width: '100%', alignSelf: 'center'}}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          />
        </View>
      </ScrollView>

      <Modal
        visible={cityPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCityPickerVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setCityPickerVisible(false)}>
          <Pressable style={styles.cityModalCard} onPress={e => e.stopPropagation()}>
            <Text style={styles.cityModalTitle}>Select City</Text>
            <TextInput
              value={citySearch}
              onChangeText={handleCitySearch}
              placeholder="Search city"
              placeholderTextColor={AppColors.textGrey}
              style={styles.citySearchInput}
            />
            {citiesLoading ? (
              <View style={styles.cityLoaderWrap}>
                <ActivityIndicator size="small" color={AppColors.red} />
              </View>
            ) : (
              <FlatList
                data={citySuggestions}
                keyExtractor={(item, index) => `${item}-${index}`}
                style={styles.cityList}
                ListEmptyComponent={
                  <Text style={styles.emptyCityText}>No city found</Text>
                }
                renderItem={({item}) => (
                  <Pressable
                    style={styles.cityItem}
                    onPress={() => {
                      setValue('city', item);
                      setSelectedCityId(cityNameToId[item] ?? null);
                      setCityPickerVisible(false);
                    }}>
                    <Text style={styles.cityItemText}>{item}</Text>
                  </Pressable>
                )}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </AppLayout>
  );
};

export default UpdateDriveProfile;

const styles = StyleSheet.create({
  button: {
    backgroundColor: AppColors.white,
    borderColor: AppColors.red,
    borderWidth: 1.5,
    marginBottom: hp(2),
  },
  buttonTitle: {
    color: AppColors.black,
  },
  inputContainer: {
    borderColor: AppColors.graySuit,
    borderWidth: 1,
    paddingHorizontal: 2,
    borderRadius: 5,
  },
  inputStyle: {color: AppColors.graySuit},
  cityPickerInput: {
    width: '50%',
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  cityPlaceholder: {
    color: AppColors.textGrey,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: hp(2),
  },
  cityModalCard: {
    backgroundColor: AppColors.white,
    borderRadius: 10,
    padding: hp(2),
    maxHeight: '70%',
  },
  cityModalTitle: {
    color: AppColors.black,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: hp(1.2),
  },
  citySearchInput: {
    borderWidth: 1,
    borderColor: AppColors.graySuit,
    borderRadius: 8,
    color: AppColors.black,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: hp(1),
  },
  cityList: {
    maxHeight: hp(40),
  },
  cityItem: {
    paddingVertical: hp(1.2),
    borderBottomWidth: 1,
    borderBottomColor: AppColors.lightGrey,
  },
  cityItemText: {
    color: AppColors.black,
  },
  emptyCityText: {
    color: AppColors.textGrey,
    textAlign: 'center',
    paddingVertical: hp(2),
  },
  cityLoaderWrap: {
    paddingVertical: hp(2),
    alignItems: 'center',
  },
});
