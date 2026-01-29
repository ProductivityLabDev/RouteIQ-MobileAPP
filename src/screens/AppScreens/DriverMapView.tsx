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

  const route = useRoute();
  const isFromMapView = route.params?.FromMapView ?? false;

  useEffect(() => {
    console.log('Route params:', route.params);
  }, []);

  const role = useAppSelector(state => state.userSlices.role);
  const employeeId = useAppSelector(state => state.userSlices.employeeId);
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

  // Use vehicle location if available, otherwise use default
  const mapCenter = currentVehicleLocation || {
    latitude: (startLocation.latitude + endLocation.latitude) / 2,
    longitude: (startLocation.longitude + endLocation.longitude) / 2,
  };

  const mapView = () => (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={AppStyles.map}
      region={{
        latitude: mapCenter.latitude,
        longitude: mapCenter.longitude,
        latitudeDelta:
          currentVehicleLocation
            ? 0.01
            : Math.abs(startLocation.latitude - endLocation.latitude) * 1.5,
        longitudeDelta:
          currentVehicleLocation
            ? 0.01
            : Math.abs(startLocation.longitude - endLocation.longitude) * 1.5,
      }}
      customMapStyle={mapCustomStyle}>
      {/* Vehicle Location Marker */}
      {currentVehicleLocation && (
        <Marker
          coordinate={currentVehicleLocation}
          anchor={{x: 0.5, y: 0.5}}
          tracksViewChanges={false}
          onPress={() => {
            console.log('📍 PIN MARKER CLICKED:');
            console.log('   Latitude:', currentVehicleLocation.latitude);
            console.log('   Longitude:', currentVehicleLocation.longitude);
            console.log('   Source:', currentGpsLocation ? 'GPS' : 'API');
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
  );

  useEffect(() => {
    if (showStartMileAgeSheet) {
      openSheet();
    }
  }, [showStartMileAgeSheet]);

  // Fetch driver details to get vehicleId
  useEffect(() => {
    if (role !== 'Driver') return;
    if (!employeeId) {
      console.log('⚠️ employeeId missing - cannot fetch driver details');
      return;
    }
    console.log('📞 Fetching driver details for employeeId:', employeeId);
    dispatch(fetchDriverDetails(employeeId));
  }, [dispatch, role, employeeId]);
  
  // Log driver details when fetched
  useEffect(() => {
    if (driverDetails) {
      console.log('✅ Driver details fetched:');
      console.log('   Full object:', JSON.stringify(driverDetails, null, 2));
      console.log('   Available keys:', Object.keys(driverDetails));
    }
  }, [driverDetails]);

  // Get vehicleId from driverDetails
  const vehicleId = useMemo(() => {
    console.log('🚗 Vehicle ID Check:');
    console.log('   driverDetails:', driverDetails ? 'Available' : 'Not available');
    
    if (driverDetails) {
      console.log('   Full driverDetails:', JSON.stringify(driverDetails, null, 2));
    }
    
    const id = 
      driverDetails?.VehicleId ??
      driverDetails?.vehicleId ??
      driverDetails?.VehicleId ??
      driverDetails?.Vehicle?.VehicleId ??
      driverDetails?.vehicle?.vehicleId ??
      driverDetails?.Route?.VehicleId ??
      driverDetails?.route?.vehicleId ??
      driverDetails?.VehicleID ??
      driverDetails?.vehicleID ??
      driverDetails?.VEHICLE_ID ??
      driverDetails?.vehicle_id ??
      null;
    
    console.log('   Extracted vehicleId:', id);
    
    if (!id && driverDetails) {
      console.log('⚠️ vehicleId not found in driverDetails. Available keys:', Object.keys(driverDetails || {}));
    }
    
    return id;
  }, [driverDetails]);

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

  // Extract current location from vehicle location data
  const currentVehicleLocation = useMemo(() => {
    // Prioritize GPS location if available
    if (currentGpsLocation?.latitude && currentGpsLocation?.longitude) {
      console.log('📍 PIN LOCATION (GPS):', {
        latitude: currentGpsLocation.latitude,
        longitude: currentGpsLocation.longitude,
        source: 'GPS',
      });
      return {
        latitude: currentGpsLocation.latitude,
        longitude: currentGpsLocation.longitude,
      };
    }
    // Fallback to vehicle location from API
    if (vehicleLocation?.latitude && vehicleLocation?.longitude) {
      console.log('📍 PIN LOCATION (API):', {
        latitude: Number(vehicleLocation.latitude),
        longitude: Number(vehicleLocation.longitude),
        source: 'API',
      });
      return {
        latitude: Number(vehicleLocation.latitude),
        longitude: Number(vehicleLocation.longitude),
      };
    }
    console.log('📍 PIN LOCATION: NULL (No location available)');
    return null;
  }, [currentGpsLocation, vehicleLocation]);

  // Log pin location whenever it changes
  useEffect(() => {
    if (currentVehicleLocation) {
      console.log('🗺️ PIN LOCATION ON MAP:', {
        latitude: currentVehicleLocation.latitude,
        longitude: currentVehicleLocation.longitude,
        source: currentGpsLocation ? 'GPS (Real-time)' : 'API (Server)',
      });
    } else {
      console.log('🗺️ PIN LOCATION: Not available on map');
    }
  }, [currentVehicleLocation, currentGpsLocation]);

  // Request location permission (MANDATORY - app use nahi kar sakte bina permission ke)
  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    console.log('requestLocationPermission: Starting permission check...');
    
    if (Platform.OS === 'android') {
      try {
        // Check if already granted
        const checkResult = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        
        console.log('requestLocationPermission: Android check result:', checkResult);
        
        if (checkResult) {
          console.log('requestLocationPermission: Permission already granted');
          setHasLocationPermission(true);
          return true;
        }

        console.log('requestLocationPermission: Requesting permission...');
        // Request permission
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
        
        console.log('requestLocationPermission: Permission request result:', granted);
        
        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        setHasLocationPermission(isGranted);
        
        if (!isGranted) {
          console.log('requestLocationPermission: Permission denied - showing alert');
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
        console.warn('Location permission error:', err);
        setHasLocationPermission(false);
        return false;
      }
    }
    
    // iOS - check permission status
    console.log('requestLocationPermission: iOS - requesting authorization');
    
    // Request authorization first
    Geolocation.requestAuthorization();
    
    // Check iOS permission status by trying to get current position
    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        () => {
          console.log('requestLocationPermission: iOS permission granted');
          setHasLocationPermission(true);
          resolve(true);
        },
        error => {
          console.log('requestLocationPermission: iOS permission denied', error);
          if (error.code === 1) {
            // PERMISSION_DENIED
            setHasLocationPermission(false);
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
            resolve(true);
          }
        },
        {enableHighAccuracy: false, timeout: 5000, maximumAge: 0},
      );
    });
  }, []);

  // Start GPS location tracking (MANDATORY - permission required)
  const startLocationTracking = useCallback(() => {
    console.log('🚀 startLocationTracking called');
    console.log('   vehicleId:', vehicleId);
    
    if (!vehicleId) {
      console.warn('❌ Cannot start location tracking: vehicleId is missing');
      return;
    }

    console.log('📍 Requesting location permission for tracking...');
    requestLocationPermission().then(hasPermission => {
      console.log('   Permission result:', hasPermission);
      
      if (!hasPermission) {
        // Permission denied - keep requesting until granted
        console.warn('❌ Location permission denied - cannot start tracking');
        // Will retry via Alert button
        return;
      }
      
      console.log('✅ Permission granted - proceeding with location tracking');

      // Configure Geolocation
      console.log('⚙️ Configuring Geolocation...');
      Geolocation.setRNConfiguration({
        skipPermissionRequests: false,
        authorizationLevel: 'whenInUse',
      });

      // First check if location service is enabled by trying to get current position
      console.log('🔍 Checking if location service is enabled...');
      Geolocation.getCurrentPosition(
        position => {
          console.log('✅ Location service is enabled, coordinates:', position.coords);
          setIsLocationServiceEnabled(true);
          
          // Start watching position
          console.log('📍 Starting GPS location tracking (watchPosition)...');
          console.log('   vehicleId:', vehicleId);
          watchIdRef.current = Geolocation.watchPosition(
            position => {
              const {latitude, longitude, speed, heading, accuracy, altitude} = position.coords;
              const timestamp = new Date().toISOString();
              
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
              console.log('📍 GPS LOCATION FETCHED:');
              console.log('   Latitude:', latitude);
              console.log('   Longitude:', longitude);
              console.log('   Speed:', speed ?? 'N/A', 'm/s');
              console.log('   Heading:', heading ?? 'N/A', 'degrees');
              console.log('   Accuracy:', accuracy ?? 'N/A', 'meters');
              console.log('   Altitude:', altitude ?? 'N/A', 'meters');
              console.log('   Timestamp:', timestamp);
              console.log('   Vehicle ID:', vehicleId);
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
              
              // Update local state
              setCurrentGpsLocation({
                latitude,
                longitude,
                speed: speed ?? undefined,
                heading: heading ?? undefined,
              });

              // Send to server
              console.log('📤 Sending location to server...');
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
                if (result.type === 'driver/updateVehicleLocation/fulfilled') {
                  console.log('✅ Location sent to server successfully');
                  console.log('   Response:', result.payload);
                } else if (result.type === 'driver/updateVehicleLocation/rejected') {
                  console.error('❌ Failed to send location to server');
                  console.error('   Error:', result.payload || result.error);
                }
              });
            },
            error => {
              console.warn('GPS location error:', error);
              // If permission error, request again
              if (error.code === 1) {
                // PERMISSION_DENIED
                console.warn('Location permission denied during tracking');
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
                    {
                      text: 'OK',
                      style: 'cancel',
                    },
                  ],
                  {cancelable: false},
                );
              } else if (error.code === 2) {
                // POSITION_UNAVAILABLE - Location service is OFF
                console.warn('⚠️ Location service turned OFF during tracking!');
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
                    {
                      text: 'OK',
                      style: 'cancel',
                    },
                  ],
                  {cancelable: false},
                );
              } else if (error.code === 3) {
                // TIMEOUT - Location accuracy might be low
                console.warn('Location timeout - Location Accuracy might be off');
                // Don't show overlay for timeout - just log it
                // setLocationAccuracyIssue(true); // Removed - not needed
              }
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 10000,
              distanceFilter: 10, // Update every 10 meters
            },
          );
        },
        error => {
          console.warn('Location service check failed:', error);
          if (error.code === 2) {
            // POSITION_UNAVAILABLE - Location service is off
            console.warn('Location service is OFF - GPS disabled');
            setIsLocationServiceEnabled(false);
            Alert.alert(
              'Location Service Disabled',
              'Your phone\'s Location/GPS service is currently OFF. Please enable it in Settings to track the vehicle.',
              [
                {
                  text: 'Open Location Settings',
                  onPress: () => {
                    if (Platform.OS === 'android') {
                      // Open location settings on Android
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
          } else if (error.code === 3) {
            // TIMEOUT - Location accuracy might be low
            console.warn('Location timeout - Location Accuracy might be off');
            setLocationAccuracyIssue(true);
          } else if (error.code === 1) {
            // PERMISSION_DENIED
            setHasLocationPermission(false);
            requestLocationPermission();
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 0,
        },
      );
    });
  }, [vehicleId, dispatch]);

  // Stop GPS location tracking
  const stopLocationTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setCurrentGpsLocation(null);
  }, []);

  // Check location permission on component mount (MANDATORY)
  useEffect(() => {
    console.log('DriverMapView: Component mounted, role:', role);
    if (role === 'Driver') {
      console.log('DriverMapView: Driver role detected - Checking location permission...');
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        requestLocationPermission().then(hasPermission => {
          console.log('DriverMapView: Location permission result:', hasPermission);
          // Force state update after permission check
          if (hasPermission) {
            setHasLocationPermission(true);
            console.log('DriverMapView: State updated to true');
          } else {
            setHasLocationPermission(false);
            console.log('DriverMapView: State updated to false - overlay should show');
          }
        });
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      console.log('DriverMapView: Not a driver role, skipping permission check');
    }
  }, [role, requestLocationPermission]);

  // Check location service when permission is granted
  useEffect(() => {
    if (role === 'Driver' && hasLocationPermission === true && vehicleId) {
      console.log('Permission granted - checking location service...');
      // Check if location service is enabled
      Geolocation.getCurrentPosition(
        position => {
          console.log('Location service is ENABLED:', position.coords);
          setIsLocationServiceEnabled(true);
        },
        error => {
          console.warn('Location service check error:', error);
          if (error.code === 2 || error.code === 3) {
            // POSITION_UNAVAILABLE or TIMEOUT - Location service is off
            console.warn('Location service is OFF - GPS disabled');
            setIsLocationServiceEnabled(false);
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 3000,
          maximumAge: 0,
        },
      );
    }
  }, [role, hasLocationPermission, vehicleId]);

  // Start location tracking as soon as vehicleId is available AND location service is enabled
  useEffect(() => {
    console.log('🔍 Checking location tracking conditions:');
    console.log('   vehicleId:', vehicleId);
    console.log('   role:', role);
    console.log('   hasLocationPermission:', hasLocationPermission);
    console.log('   isLocationServiceEnabled:', isLocationServiceEnabled);
    
    if (vehicleId && role === 'Driver' && hasLocationPermission === true && isLocationServiceEnabled === true) {
      console.log('✅ All conditions met - starting location tracking');
      startLocationTracking();
    } else {
      console.log('❌ Conditions not met - waiting for:');
      if (!vehicleId) console.log('   - vehicleId missing');
      if (role !== 'Driver') console.log('   - role is not Driver');
      if (hasLocationPermission !== true) console.log('   - location permission not granted');
      if (isLocationServiceEnabled !== true) console.log('   - location service not enabled');
    }

    return () => {
      stopLocationTracking();
    };
  }, [vehicleId, role, hasLocationPermission, isLocationServiceEnabled, startLocationTracking, stopLocationTracking]);

  // Continuous location service monitoring (app chalne ke dauran bhi check karega)
  useEffect(() => {
    if (role !== 'Driver' || hasLocationPermission !== true) return;

    const checkLocationService = () => {
      console.log('Checking location service status...');
      Geolocation.getCurrentPosition(
        position => {
          console.log('✅ Location service is ENABLED');
          setIsLocationServiceEnabled(true);
          setLocationAccuracyIssue(false);
        },
        error => {
          console.warn('❌ Location service check failed:', error);
          if (error.code === 2 || error.code === 3) {
            // Location service is OFF
            console.warn('⚠️ Location service is OFF - showing alert');
            setIsLocationServiceEnabled(false);
            
            // Show alert only if tracking is active
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
          timeout: 3000,
          maximumAge: 0,
        },
      );
    };

    // Check immediately
    checkLocationService();

    // Continuous monitoring - har 10 seconds check karega
    const monitoringInterval = setInterval(() => {
      if (watchIdRef.current !== null) {
        // Only check if tracking is active
        checkLocationService();
      }
    }, 10000); // Check every 10 seconds

    // Also check when app comes to foreground
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        console.log('App came to foreground - checking location service');
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
              onPress={() => {
                setTripStarted(true);
                openSheet();
              }}
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
              onPress={() => {
                console.log('Overlay: Enable button pressed');
                requestLocationPermission();
              }}
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
                console.log('Overlay: Open location settings pressed');
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
