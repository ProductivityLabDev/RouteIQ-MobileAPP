import {Pressable, StyleSheet, Text, View} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import AppLayout from '../../layout/AppLayout';
import AppHeader from '../../components/AppHeader';
import {AppColors} from '../../utils/color';
import AppStyles from '../../styles/AppStyles';
import AppBottomSheet from '../../components/AppBottomSheet';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {fontSize, size} from '../../utils/responsiveFonts';
import AppInput from '../../components/AppInput';
import AppButton from '../../components/AppButton';
import {hp} from '../../utils/constants';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {mapCustomStyle} from '../../utils/mapConfig';
import AppFonts from '../../utils/appFonts';
import GlobalIcon from '../../components/GlobalIcon';
import AlarmIcon from '../../assets/svgs/AlarmIcon';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Image} from 'react-native';
import {useKeyboard} from '../../utils/keyboard';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {getVehicleLocation, updateVehicleLocation, fetchDriverDetails} from '../../store/driver/driverSlices';
import Geolocation from '@react-native-community/geolocation';
import {Platform, PermissionsAndroid, Alert, Linking, AppState} from 'react-native';

const DriverMapView = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const keyboardHeight = useKeyboard();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const mapViewRouteBackOn = useAppSelector(
    state => state.userSlices.mapViewRouteBackOn,
  );
  const [endTrip, setEndTrip] = useState(false);
  const [tripEnd, setTripEnd] = useState(false);
  const showStartMileAgeSheet = useAppSelector(
    state => state.userSlices.showStartMileAgeSheet,
  );
  const [tripStarted, setTripStarted] = useState(false); // new
  const [currentGpsLocation, setCurrentGpsLocation] = useState<{
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
  } | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  const [isLocationServiceEnabled, setIsLocationServiceEnabled] = useState<boolean | null>(null);
  const [locationAccuracyIssue, setLocationAccuracyIssue] = useState<boolean>(false);
  const watchIdRef = useRef<number | null>(null);
  const lastLocationSendRef = useRef<number>(0);
  const mapRef = useRef<MapView>(null);
  const LOCATION_SEND_INTERVAL_MS = 15000; // Throttle: send to server at most every 15s
  const gpsFixReceivedRef = useRef(false);
  const gpsFallbackTriedRef = useRef(false);
  const gpsPollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gpsNoFixTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isStartingTrackingRef = useRef(false);

  const route = useRoute();
  const isFromMapView =
    (route.params as any)?.FromMapView ?? (route.params as any)?.fromMapView ?? false;

  useEffect(() => {
    if (__DEV__ && route?.params != null) {
      console.log('Route params:', route.params);
    }
  }, [route?.params]);

  const role = useAppSelector(state => state.userSlices.role);
  const employeeId = useAppSelector(state => state.userSlices.employeeId);
  const tokenVehicleId = useAppSelector(state => (state as any).userSlices.vehicleId);
  const driverDetails = useAppSelector(state => state.driverSlices.driverDetails);
  const vehicleLocation = useAppSelector(state => state.driverSlices.vehicleLocation);

  const snapPoints = useMemo(
    () => [keyboardHeight ? '30%' : '23%', '10%'],
    [keyboardHeight],
  );
  const openSheet = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const closeSheet = useCallback(() => {
    bottomSheetModalRef.current?.close();
  }, []);

  const startLocation = {
    latitude: 37.7749,
    longitude: -122.4454,
  };

  const endLocation = {
    latitude: 37.7793,
    longitude: -122.426,
  };

  // Live pin: always prefer driver's GPS (Karachi/current). API = fallback only when GPS not yet available.
  const currentVehicleLocation = useMemo(() => {
    if (currentGpsLocation?.latitude != null && currentGpsLocation?.longitude != null) {
      return {
        latitude: currentGpsLocation.latitude,
        longitude: currentGpsLocation.longitude,
      };
    }
    const apiLatRaw =
      (vehicleLocation as any)?.latitude ??
      (vehicleLocation as any)?.Latitude ??
      (vehicleLocation as any)?.LATITUDE ??
      null;
    const apiLngRaw =
      (vehicleLocation as any)?.longitude ??
      (vehicleLocation as any)?.Longitude ??
      (vehicleLocation as any)?.LONGITUDE ??
      null;
    const apiLat = apiLatRaw != null ? Number(apiLatRaw) : null;
    const apiLng = apiLngRaw != null ? Number(apiLngRaw) : null;
    if (apiLat != null && apiLng != null && Number.isFinite(apiLat) && Number.isFinite(apiLng)) {
      return { latitude: apiLat, longitude: apiLng };
    }
    return null;
  }, [currentGpsLocation, vehicleLocation]);

  // Use vehicle location if available, otherwise use default
  const mapCenter = currentVehicleLocation || {
    latitude: (startLocation.latitude + endLocation.latitude) / 2,
    longitude: (startLocation.longitude + endLocation.longitude) / 2,
  };

  const mapRegion = useMemo(
    () => ({
      latitude: mapCenter.latitude,
      longitude: mapCenter.longitude,
      latitudeDelta: currentVehicleLocation
        ? 0.01
        : Math.abs(startLocation.latitude - endLocation.latitude) * 1.5 || 0.05,
      longitudeDelta: currentVehicleLocation
        ? 0.01
        : Math.abs(startLocation.longitude - endLocation.longitude) * 1.5 || 0.05,
    }),
    [
      mapCenter.latitude,
      mapCenter.longitude,
      currentVehicleLocation != null,
      startLocation.latitude,
      startLocation.longitude,
      endLocation.latitude,
      endLocation.longitude,
    ],
  );

  // Live tracking: follow driver when GPS updates
  useEffect(() => {
    if (!currentGpsLocation?.latitude || !currentGpsLocation?.longitude || !mapRef.current) return;
    mapRef.current.animateToRegion(
      {
        latitude: currentGpsLocation.latitude,
        longitude: currentGpsLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      300,
    );
  }, [currentGpsLocation?.latitude, currentGpsLocation?.longitude]);

  const mapView = useCallback(
    () => (
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={AppStyles.map}
        region={mapRegion}
        customMapStyle={mapCustomStyle}
        showsMyLocationButton={false}
        followsUserLocation={false}>
      {/* Vehicle Location Marker - live GPS when available */}
      {currentVehicleLocation && (
        <Marker
          coordinate={currentVehicleLocation}
          anchor={{x: 0.5, y: 0.5}}
          tracksViewChanges={!!currentGpsLocation}
          onPress={() => {
            if (__DEV__) {
              console.log('📍 PIN MARKER CLICKED:');
              console.log('   Latitude:', currentVehicleLocation.latitude);
              console.log('   Longitude:', currentVehicleLocation.longitude);
              console.log('   Source:', currentGpsLocation ? 'GPS' : 'API');
            }
          }}>
          <View
            style={{
              backgroundColor: AppColors.red,
              borderRadius: 20,
              padding: 8,
              borderWidth: 3,
              borderColor: AppColors.white,
            }}>
            <GlobalIcon
              library="MaterialCommunityIcons"
              name="bus"
              color={AppColors.white}
              size={hp(3)}
            />
          </View>
        </Marker>
      )}
    </MapView>
    ),
    [mapRegion, currentVehicleLocation, currentGpsLocation, mapRef],
  );

  useEffect(() => {
    if (showStartMileAgeSheet) {
      openSheet();
    }
  }, [showStartMileAgeSheet]);

  // Fetch driver details to get vehicleId
  useEffect(() => {
    if (role !== 'Driver') return;
    if (tokenVehicleId) return; // Prefer token vehicleId; avoid extra network call
    if (!employeeId) {
      if (__DEV__) console.log('⚠️ employeeId missing - cannot fetch driver details');
      return;
    }
    if (__DEV__) console.log('📞 Fetching driver details for employeeId:', employeeId);
    dispatch(fetchDriverDetails(employeeId));
  }, [dispatch, role, employeeId, tokenVehicleId]);

  // VehicleId: prefer token claim, fallback to driverDetails
  const vehicleId = useMemo(() => {
    if (tokenVehicleId) return tokenVehicleId;
    const id =
      driverDetails?.VehicleId ??
      driverDetails?.vehicleId ??
      driverDetails?.Vehicle?.VehicleId ??
      driverDetails?.vehicle?.vehicleId ??
      driverDetails?.Route?.VehicleId ??
      driverDetails?.route?.vehicleId ??
      driverDetails?.VehicleID ??
      driverDetails?.vehicleID ??
      driverDetails?.VEHICLE_ID ??
      driverDetails?.vehicle_id ??
      null;
    if (__DEV__ && driverDetails && !id) {
      console.log('⚠️ vehicleId not found in driverDetails. Available keys:', Object.keys(driverDetails || {}));
    }
    return id;
  }, [tokenVehicleId, driverDetails]);

  // Polling for vehicle location
  useEffect(() => {
    if (role !== 'Driver') return;
    if (!vehicleId) return;

    // Initial fetch
    dispatch(getVehicleLocation({vehicleId}));

    // Set up polling every 10 seconds
    const interval = setInterval(() => {
      dispatch(getVehicleLocation({vehicleId}));
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [dispatch, role, vehicleId]);

  // Request location permission (MANDATORY - app use nahi kar sakte bina permission ke)
  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    if (__DEV__) console.log('requestLocationPermission: Starting permission check...');

    if (Platform.OS === 'android') {
      try {
        const checkResult = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (checkResult) {
          if (__DEV__) console.log('requestLocationPermission: Permission already granted');
          setHasLocationPermission(true);
          return true;
        }

        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission Required',
            message: 'This app REQUIRES location access to function. Without location permission, you cannot use this app. Please enable location permission.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'Enable Location',
          },
        );

        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        setHasLocationPermission(isGranted);
        if (__DEV__) console.log('requestLocationPermission: Permission result:', isGranted);

        if (!isGranted) {
          if (__DEV__) console.log('requestLocationPermission: Permission denied - showing alert');
          // Permission denied - show alert and keep requesting
          Alert.alert(
            'Location Permission Required',
            'This app cannot function without location permission. Please enable location access in Settings to continue using the app.',
            [
              {
                text: 'Request Again',
                onPress: () => {
                  // Retry after a short delay
                  setTimeout(() => {
                    requestLocationPermission();
                  }, 1000);
                },
              },
              {
                text: 'Open Settings',
                onPress: () => {
                  // Open app settings
                  Linking.openSettings();
                },
              },
            ],
            {cancelable: false},
          );
        }
        
        return isGranted;
      } catch (err) {
        if (__DEV__) console.warn('Location permission error:', err);
        setHasLocationPermission(false);
        return false;
      }
    }

    Geolocation.requestAuthorization();

    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        () => {
          setHasLocationPermission(true);
          if (__DEV__) console.log('requestLocationPermission: iOS permission granted');
          resolve(true);
        },
        error => {
          if (__DEV__) console.log('requestLocationPermission: iOS permission denied', error);
          if (error.code === 1) {
            // PERMISSION_DENIED
            setHasLocationPermission(false);
            if (__DEV__) console.log('requestLocationPermission: iOS permission denied');
            Alert.alert(
              'Location Permission Required',
              'This app cannot function without location permission. Please enable location access in Settings to continue using the app.',
              [
                {
                  text: 'Request Again',
                  onPress: () => {
                    setTimeout(() => {
                      requestLocationPermission();
                    }, 1000);
                  },
                },
                {
                  text: 'Open Settings',
                  onPress: () => {
                    Linking.openSettings();
                  },
                },
              ],
              {cancelable: false},
            );
            resolve(false);
          } else {
            // Other error - assume permission granted but location unavailable
            setHasLocationPermission(true);
            if (__DEV__) console.log('requestLocationPermission: iOS non-critical error, allowing');
            resolve(true);
          }
        },
        {enableHighAccuracy: false, timeout: 5000, maximumAge: 0},
      );
    });
  }, []);

  // Start GPS location tracking (MANDATORY - permission required)
  const startLocationTracking = useCallback(() => {
    if (!vehicleId) {
      if (__DEV__) console.warn('❌ Cannot start location tracking: vehicleId is missing');
      return;
    }
    // Avoid starting multiple watchers
    if (watchIdRef.current !== null) {
      if (__DEV__) console.log('📍 watchPosition already active, id:', watchIdRef.current);
      return;
    }
    // Avoid parallel starts (can happen in dev / StrictMode / rapid re-renders)
    if (isStartingTrackingRef.current) {
      if (__DEV__) console.log('📍 startLocationTracking already in progress...');
      return;
    }
    isStartingTrackingRef.current = true;

    const permissionPromise =
      hasLocationPermission === true
        ? Promise.resolve(true)
        : requestLocationPermission().catch(() => false);

    permissionPromise.then(hasPermission => {
      isStartingTrackingRef.current = false;
      if (!hasPermission) {
        if (__DEV__) console.warn('❌ Location permission denied - cannot start tracking');
        return;
      }

      Geolocation.setRNConfiguration({
        skipPermissionRequests: false,
        authorizationLevel: 'whenInUse',
      });

      // Start watchPosition immediately.
      // Do NOT depend on getCurrentPosition success (it can TIMEOUT while GPS is ON).
      if (__DEV__) console.log('📍 Starting watchPosition for live GPS');
      setIsLocationServiceEnabled(true);
      watchIdRef.current = Geolocation.watchPosition(
        position => {
          const {latitude, longitude, speed, heading} = position.coords;
          const timestamp = new Date().toISOString();
          setIsLocationServiceEnabled(true);
          if (!gpsFixReceivedRef.current) {
            gpsFixReceivedRef.current = true;
            if (gpsNoFixTimerRef.current) {
              clearTimeout(gpsNoFixTimerRef.current);
              gpsNoFixTimerRef.current = null;
            }
            if (__DEV__) {
              console.log('📡 GPS FIX RECEIVED:', {latitude, longitude});
            }
          }

          // Update local state every time (smooth map pin)
          setCurrentGpsLocation({
            latitude,
            longitude,
            speed: speed ?? undefined,
            heading: heading ?? undefined,
          });

          // Send to server only when throttled (battery + network)
          const now = Date.now();
          if (now - lastLocationSendRef.current >= LOCATION_SEND_INTERVAL_MS) {
            lastLocationSendRef.current = now;
            dispatch(
              updateVehicleLocation({
                vehicleId,
                latitude,
                longitude,
                speed: speed ?? undefined,
                heading: heading ?? undefined,
                timestamp,
              }),
            ).then((result: any) => {
              if (__DEV__) {
                if (result.type === 'driver/updateVehicleLocation/fulfilled') {
                  console.log('✅ Location sent to server');
                } else if (result.type === 'driver/updateVehicleLocation/rejected') {
                  console.warn('❌ Send location failed:', result.payload || result.error);
                }
              }
            });
          }
        },
        error => {
          if (__DEV__) {
            console.warn('GPS location error:', {
              code: (error as any)?.code,
              message: (error as any)?.message,
              details: error,
            });
          }
          if (error.code === 1) {
            if (__DEV__) console.warn('Location permission denied during tracking');
            setHasLocationPermission(false);
            Alert.alert(
              'Location Permission Revoked',
              'Location permission has been revoked. Please enable it again to continue tracking.',
              [
                {
                  text: 'Enable Permission',
                  onPress: () => {
                    requestLocationPermission();
                  },
                },
                {text: 'OK', style: 'cancel'},
              ],
              {cancelable: false},
            );
          } else if (error.code === 2) {
            if (__DEV__) console.warn('⚠️ Location service turned OFF during tracking!');
            setIsLocationServiceEnabled(false);
            Alert.alert(
              '⚠️ Location Service Turned OFF',
              'Your Location/GPS service has been turned OFF. Please enable it immediately to continue tracking the vehicle.',
              [
                {
                  text: 'Open Settings',
                  onPress: () => {
                    if (Platform.OS === 'android') {
                      Linking.openURL('android.settings.LOCATION_SOURCE_SETTINGS').catch(() => {
                        Linking.openSettings();
                      });
                    } else {
                      Linking.openSettings();
                    }
                  },
                },
                {text: 'OK', style: 'cancel'},
              ],
              {cancelable: false},
            );
          } else if (error.code === 3) {
            // TIMEOUT: often happens on first fix even when GPS is ON.
            // Try a one-time network-based location to seed current position.
            if (!gpsFixReceivedRef.current && !gpsFallbackTriedRef.current) {
              gpsFallbackTriedRef.current = true;
              Geolocation.getCurrentPosition(
                pos => {
                  const {latitude: lat, longitude: lng, speed: sp, heading: hd} = pos.coords;
                  gpsFixReceivedRef.current = true;
                  setIsLocationServiceEnabled(true);
                  if (gpsNoFixTimerRef.current) {
                    clearTimeout(gpsNoFixTimerRef.current);
                    gpsNoFixTimerRef.current = null;
                  }
                  if (__DEV__) {
                    console.log('📡 GPS FALLBACK FIX (network):', {latitude: lat, longitude: lng});
                  }
                  setCurrentGpsLocation({
                    latitude: lat,
                    longitude: lng,
                    speed: sp ?? undefined,
                    heading: hd ?? undefined,
                  });
                },
                err => {
                  if (__DEV__) {
                    console.warn('GPS fallback getCurrentPosition failed:', {
                      code: (err as any)?.code,
                      message: (err as any)?.message,
                      details: err,
                    });
                  }
                },
                {enableHighAccuracy: false, timeout: 15000, maximumAge: 0},
              );
            }
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
          distanceFilter: 0, // Ensure we get an initial fix even if driver isn't moving
        },
      );

      if (__DEV__) console.log('📍 watchPosition started, id:', watchIdRef.current);
      if (!gpsNoFixTimerRef.current) {
        gpsNoFixTimerRef.current = setTimeout(() => {
          if (__DEV__ && !gpsFixReceivedRef.current) {
            console.warn(
              '⚠️ No GPS fix yet (10s). Waiting… If this is an emulator, set emulator location; if real device, try open-sky + Precise location ON.',
            );
          }
        }, 10000);
      }

      // Warm up + fallback polling: if watchPosition doesn't emit, poll every 15s
      const pollOnce = () => {
        // Try fast "cached / network" first to get *something* quickly.
        Geolocation.getCurrentPosition(
          pos => {
            const {latitude: lat, longitude: lng, speed: sp, heading: hd} = pos.coords;
            gpsFixReceivedRef.current = true;
            setIsLocationServiceEnabled(true);
            if (__DEV__) {
              console.log('📡 GPS POLL FIX:', {latitude: lat, longitude: lng});
            }
            setCurrentGpsLocation({
              latitude: lat,
              longitude: lng,
              speed: sp ?? undefined,
              heading: hd ?? undefined,
            });
            if (gpsPollIntervalRef.current) {
              clearInterval(gpsPollIntervalRef.current);
              gpsPollIntervalRef.current = null;
            }
          },
          error => {
            if (__DEV__) {
              console.warn('📡 GPS POLL ERROR:', {
                code: (error as any)?.code,
                message: (error as any)?.message,
                details: error,
              });
              if ((error as any)?.code === 3) {
                console.warn(
                  'ℹ️ Location TIMEOUT usually means no provider fix yet. If emulator, set a manual location. If real device, turn ON Google Location Accuracy + Wi‑Fi/Data and try open-sky.',
                );
              }
            }
            if (error?.code === 2) {
              setIsLocationServiceEnabled(false);
            }
          },
          // Low accuracy + allow cached last-known location (often returns instantly)
          {enableHighAccuracy: false, timeout: 12000, maximumAge: 60000},
        );
      };
      pollOnce();
      if (!gpsPollIntervalRef.current && !gpsFixReceivedRef.current) {
        gpsPollIntervalRef.current = setInterval(pollOnce, 15000);
      }
    });
  }, [vehicleId, dispatch, requestLocationPermission, hasLocationPermission]);

  // Stop GPS location tracking
  const stopLocationTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      if (__DEV__) console.log('🛑 Stopping watchPosition, id:', watchIdRef.current);
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (gpsPollIntervalRef.current) {
      clearInterval(gpsPollIntervalRef.current);
      gpsPollIntervalRef.current = null;
    }
    if (gpsNoFixTimerRef.current) {
      clearTimeout(gpsNoFixTimerRef.current);
      gpsNoFixTimerRef.current = null;
    }
    setCurrentGpsLocation(null);
  }, []);

  // Check location permission on component mount (MANDATORY)
  useEffect(() => {
    if (role !== 'Driver') return;
    const timer = setTimeout(() => {
      requestLocationPermission().then(hasPermission => {
        setHasLocationPermission(hasPermission);
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [role, requestLocationPermission]);

  // Check location service when permission is granted
  // Only treat POSITION_UNAVAILABLE (2) as GPS off; TIMEOUT (3) = slow fix, don't block
  useEffect(() => {
    if (role !== 'Driver' || hasLocationPermission !== true) return;
    Geolocation.getCurrentPosition(
      position => {
        setIsLocationServiceEnabled(true);
      },
      error => {
        if (error?.code === 2) {
          if (__DEV__) console.warn('Location service check error (GPS off):', error);
          setIsLocationServiceEnabled(false);
        } else {
          // Timeout (3) or other: assume GPS on, allow (first fix can be slow)
          if (__DEV__ && error?.code === 3) {
            console.log('Location taking time (timeout) – allowing, watchPosition will get fix.');
          }
          setIsLocationServiceEnabled(true);
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 12000,
        maximumAge: 5000,
      },
    );
  }, [role, hasLocationPermission]);

  const ensureDriverCanStartTrip = useCallback(async (): Promise<boolean> => {
    if (role !== 'Driver') return false;

    const hasPermission =
      hasLocationPermission === true
        ? true
        : await requestLocationPermission().catch(() => false);

    if (!hasPermission) {
      setHasLocationPermission(false);
      return false;
    }

    // Check if location service (GPS) is enabled
    const serviceEnabled = await new Promise<boolean>(resolve => {
      Geolocation.getCurrentPosition(
        () => resolve(true),
        error => {
          if (__DEV__) console.warn('StartTrip location service check error:', error);
          // Only POSITION_UNAVAILABLE (2) = GPS really off; TIMEOUT (3) = slow fix, allow
          if (error?.code === 2) {
            resolve(false);
            return;
          }
          resolve(true);
        },
        {enableHighAccuracy: false, timeout: 8000, maximumAge: 5000},
      );
    });

    setIsLocationServiceEnabled(serviceEnabled);
    if (!serviceEnabled) {
      Alert.alert(
        'Location Service is OFF',
        'Driver cannot go online or start trip until Location/GPS service is ON.',
        [
          {
            text: 'Open Settings',
            onPress: () => {
              if (Platform.OS === 'android') {
                Linking.openURL('android.settings.LOCATION_SOURCE_SETTINGS').catch(() => {
                  Linking.openSettings();
                });
              } else {
                Linking.openSettings();
              }
            },
          },
          {text: 'Cancel', style: 'cancel'},
        ],
        {cancelable: false},
      );
      return false;
    }

    if (!vehicleId) {
      Alert.alert(
        'Vehicle not ready',
        'Vehicle ID not found yet. Please wait a moment and try again.',
        [{text: 'OK'}],
      );
      return false;
    }

    return true;
  }, [role, hasLocationPermission, requestLocationPermission, vehicleId]);

  const handleStartTripPress = useCallback(async () => {
    const ok = await ensureDriverCanStartTrip();
    if (!ok) return;
    setTripStarted(true);
    openSheet();
  }, [ensureDriverCanStartTrip, openSheet]);

  // Start location tracking as soon as we have permission + vehicleId.
  // Do not block on isLocationServiceEnabled (getCurrentPosition may TIMEOUT even when GPS is ON).
  useEffect(() => {
    if (vehicleId && role === 'Driver' && hasLocationPermission === true) {
      startLocationTracking();
    }
    return () => {
      stopLocationTracking();
    };
  }, [vehicleId, role, hasLocationPermission, startLocationTracking, stopLocationTracking]);

  // Continuous location service monitoring (app chalne ke dauran bhi check karega)
  useEffect(() => {
    if (role !== 'Driver' || hasLocationPermission !== true) return;

    const checkLocationService = () => {
      Geolocation.getCurrentPosition(
        position => {
          setIsLocationServiceEnabled(true);
          setLocationAccuracyIssue(false);
        },
        error => {
          if (error?.code === 2) {
            if (__DEV__) console.warn('Location service check failed (GPS off):', error);
            setIsLocationServiceEnabled(false);
            if (watchIdRef.current !== null) {
              Alert.alert(
                '⚠️ Location Service Turned OFF',
                'Your Location/GPS service has been turned OFF. Please enable it immediately to continue tracking.',
                [
                  {
                    text: 'Open Settings',
                    onPress: () => {
                      if (Platform.OS === 'android') {
                        Linking.openURL('android.settings.LOCATION_SOURCE_SETTINGS').catch(() => {
                          Linking.openSettings();
                        });
                      } else {
                        Linking.openSettings();
                      }
                    },
                  },
                  {
                    text: 'OK',
                    style: 'cancel',
                  },
                ],
                {cancelable: false},
              );
            }
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 5000,
        },
      );
    };

    checkLocationService();

    // Continuous monitoring - har 10 seconds check karega
    const monitoringInterval = setInterval(() => {
      if (watchIdRef.current !== null) {
        // Only check if tracking is active
        checkLocationService();
      }
    }, 10000); // Check every 10 seconds

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        checkLocationService();
      }
    });

    return () => {
      clearInterval(monitoringInterval);
      subscription?.remove();
    };
  }, [role, hasLocationPermission]);

  return (
    <>
      <AppLayout
        statusbackgroundColor={AppColors.red}
        style={{backgroundColor: AppColors.driverScreen}}>
      <AppHeader
        role="Driver"
        title="Map View"
        enableBack={true}
        rightIcon={true}
      />
      <View style={[AppStyles.row, styles.durationContainer]}>
        <Text style={AppStyles.whiteSubTitle}>Duration: 37 min</Text>
        <Text style={AppStyles.whiteSubTitle}>Distance: 2 miles</Text>
        <Text style={AppStyles.whiteSubTitle}>Late: 15 min</Text>
      </View>
      <View style={[AppStyles.driverContainer, {paddingHorizontal: hp(0)}]}>
        {mapView()}

        <Pressable
          style={[
            styles.bottomContainers,
            {bottom: hp(20), justifyContent: 'center'},
          ]}>
          <Image source={require('../../assets/images/mappic.png')} />
        </Pressable>

        <View style={[styles.absoluteContainer]}>
          <View style={[AppStyles.rowBetween, {alignItems: 'flex-end'}]}>
            <View style={{gap: 10}}>
              <View style={styles.firstContainer}>
                <Text style={styles.boardTitle}>Trip# 03</Text>
                <Text style={styles.boardTitle}>Students on board</Text>
                {/* <Text style={styles.boardTitle}>on board:</Text> */}
                <Text style={styles.boardDate}>10 / 12</Text>
              </View>
              {!endTrip && (
                <View style={styles.distanceContainer}>
                  <View style={AppStyles.row}>
                    <GlobalIcon
                      library="MaterialCommunityIcons"
                      name="arrow-right-top-bold"
                    />
                    <Text style={styles.boardDate}>50 Feet</Text>
                  </View>
                  <Text style={AppStyles.whiteSubTitle}>
                    Turn right on banker road
                  </Text>
                </View>
              )}
            </View>
            <Pressable
              onPress={() => navigation.navigate('AlertScreen')}
              style={AppStyles.alarmIcon}>
              <AlarmIcon />
            </Pressable>
          </View>
          {/* {role === 'Driver' && 
          <AppButton
            title="End Trip"
            onPress={() => {
              setTripEnd(true);
              openSheet();
            }}
            style={{width: '100%', marginTop: hp(2)}}
          />
          } */}

          {role === 'Driver' && !isFromMapView && !tripStarted && (
            <AppButton
              title="Start Trip"
              onPress={handleStartTripPress}
              style={{width: '100%', marginTop: hp(2)}}
            />
          )}

          {role === 'Driver' && !isFromMapView && tripStarted && (
            <AppButton
              title="End Trip"
              onPress={() => {
                setTripEnd(true);
                openSheet();
              }}
              style={{width: '100%', marginTop: hp(2)}}
            />
          )}

          {/* {endTrip && (
            <AppButton
              title="End Trip"
              onPress={() => {
                setTripEnd(true);
                openSheet();
              }}
              style={{width: '100%', marginTop: hp(2)}}
            />
          )} */}
        </View>
      </View>

      <AppBottomSheet
        bottomSheetModalRef={bottomSheetModalRef}
        snapPoints={snapPoints}
        backdropComponent={({style}) => (
          <Pressable
            onPress={() => closeSheet()}
            style={[style, {backgroundColor: 'rgba(0, 0, 0, 0.6)'}]}
          />
        )}>
        <View style={AppStyles.center}>
          <Text
            style={[
              AppStyles.titleHead,
              {fontSize: size.xlg, marginTop: hp(2)},
            ]}>
            {tripEnd ? ' Enter End Mileage*' : ' Enter Start Mileage*'}
          </Text>
          <AppInput
            placeholder={
              tripEnd ? ' Enter End Mileage' : ' Enter Start Mileage'
            }
            textAlignVertical="center"
            container={styles.inputContainer}
            inputStyle={styles.inputStyle}
            keyboardType="number-pad"
          />
          <View style={[AppStyles.rowBetween, AppStyles.widthFullPercent]}>
            <AppButton
              title="Back"
              style={styles.backButton}
              titleStyle={{color: AppColors.textLightGrey}}
              onPress={() => closeSheet()}
            />
            <AppButton
              title="Submit"
              style={styles.submitButton}
              onPress={() => {
                if (tripEnd) {
                  // Ending trip
                  navigation.navigate('DriverHomeScreen');
                } else {
                  // Starting trip
                  setTripStarted(true);
                  closeSheet(); // close and stay on map
                }
              }}
            />
          </View>
        </View>
      </AppBottomSheet>
      </AppLayout>
      
      {/* Overlays outside AppLayout - sabse upar dikhenge */}
      {/* Location Permission Required Overlay - App use nahi kar sakte bina permission ke */}
      {role === 'Driver' && hasLocationPermission !== true && (
        <View style={styles.permissionOverlay}>
          <View style={styles.permissionContainer}>
            <GlobalIcon
              library="MaterialIcons"
              name="location-off"
              color={AppColors.red}
              size={hp(8)}
            />
            <Text style={styles.permissionTitle}>
              Location Permission Required
            </Text>
            <Text style={styles.permissionMessage}>
              This app REQUIRES location access to function.{'\n'}
              Without location permission, you cannot use this app.
            </Text>
            <AppButton
              title="Enable Location Permission"
              onPress={() => requestLocationPermission()}
              style={{width: '80%', marginTop: hp(2)}}
            />
            <Text style={styles.permissionNote}>
              Please enable location permission to continue
            </Text>
          </View>
        </View>
      )}
      
      {/* Location Service Disabled Overlay - GPS/Location service off hai */}
      {role === 'Driver' && hasLocationPermission === true && isLocationServiceEnabled === false && (
        <View style={styles.permissionOverlay}>
          <View style={styles.permissionContainer}>
            <GlobalIcon
              library="MaterialIcons"
              name="gps-off"
              color={AppColors.red}
              size={hp(8)}
            />
            <Text style={styles.permissionTitle}>
              Location/GPS Service is OFF
            </Text>
            <Text style={styles.permissionMessage}>
              Your phone's Location/GPS service is currently OFF.{'\n\n'}
              <Text style={{fontWeight: 'bold', color: AppColors.red}}>
                Location permission is granted, but GPS service is disabled.
              </Text>
              {'\n\n'}
              Please enable Location/GPS service in your phone Settings to track the vehicle.
            </Text>
            <AppButton
              title="Open Location Settings"
              onPress={() => {
                if (Platform.OS === 'android') {
                  Linking.openURL('android.settings.LOCATION_SOURCE_SETTINGS').catch(() => {
                    Linking.openSettings();
                  });
                } else {
                  Linking.openSettings();
                }
              }}
              style={{width: '80%', marginTop: hp(2)}}
            />
            <Text style={styles.permissionNote}>
              Steps:{'\n'}
              1. Tap "Open Location Settings"{'\n'}
              2. Turn ON Location/GPS service{'\n'}
              3. Return to app - tracking will start automatically
            </Text>
          </View>
        </View>
      )}
      
    </>
  );
};

export default DriverMapView;

const styles = StyleSheet.create({
  durationContainer: {
    backgroundColor: AppColors.black,
    justifyContent: 'space-around',
    paddingVertical: hp(1),
  },
  firstContainer: {
    backgroundColor: AppColors.black,
    width: hp(20),
    paddingHorizontal: hp(1),
    paddingVertical: hp(1),
    borderRadius: hp(1),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boardDate: {
    fontSize: size.slg,
    color: AppColors.white,
    fontFamily: AppFonts.NunitoSansSemiBold,
  },
  boardTitle: {
    fontSize: 14,
    color: AppColors.white,
    fontFamily: AppFonts.NunitoSansMedium,
  },
  distanceContainer: {
    backgroundColor: AppColors.black,
    padding: hp(1.5),
    borderRadius: hp(1),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  absoluteContainer: {
    position: 'absolute',
    bottom: hp(1),
    width: '100%',
    paddingHorizontal: hp(2),
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: AppColors.dimGray,
    borderRadius: 5,
    width: '60%',
    marginTop: hp(2),
    marginBottom: hp(1),
  },
  inputStyle: {
    textAlign: 'center',
  },
  backButton: {
    width: '36%',
    backgroundColor: AppColors.screenColor,
  },

  submitButton: {width: '60%'},
  bottomContainers: {
    position: 'absolute',
    bottom: hp(28),
    paddingHorizontal: hp(2),
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'flex-end',
  },
  permissionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
    elevation: 9999, // Android ke liye
  },
  permissionContainer: {
    backgroundColor: AppColors.white,
    borderRadius: hp(2),
    padding: hp(3),
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  permissionTitle: {
    fontSize: size.lg,
    fontFamily: AppFonts.NunitoSansBold,
    color: AppColors.black,
    marginTop: hp(2),
    textAlign: 'center',
  },
  permissionMessage: {
    fontSize: size.md,
    fontFamily: AppFonts.NunitoSansRegular,
    color: AppColors.textLightGrey,
    marginTop: hp(1.5),
    textAlign: 'center',
    lineHeight: hp(2.5),
  },
  permissionNote: {
    fontSize: size.sm,
    fontFamily: AppFonts.NunitoSansRegular,
    color: AppColors.textLightGrey,
    marginTop: hp(1.5),
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
