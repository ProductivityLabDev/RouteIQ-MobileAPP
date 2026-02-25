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
import MapView, {Marker, Polyline, PROVIDER_GOOGLE} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {mapCustomStyle} from '../../utils/mapConfig';
import AppFonts from '../../utils/appFonts';
import GlobalIcon from '../../components/GlobalIcon';
import AlarmIcon from '../../assets/svgs/AlarmIcon';
import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import {Image} from 'react-native';
import {useKeyboard} from '../../utils/keyboard';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {getVehicleLocation, updateVehicleLocation, fetchDriverDetails, fetchRoutesByDate, startTrip, endTrip, setActiveRouteId, setRouteStarted} from '../../store/driver/driverSlices';
import Geolocation from '@react-native-community/geolocation';
import {Platform, PermissionsAndroid, Alert, Linking, AppState} from 'react-native';
import {googleMapsApiKey} from '../../utils/mapConfig';
import {getApiBaseUrl} from '../../utils/apiConfig';
import {showSuccessToast} from '../../utils/toast';

const DriverMapView = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
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
  const [startMileage, setStartMileage] = useState('');
  const [onBoardCount, setOnBoardCount] = useState(0);
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);
  const [directionHint, setDirectionHint] = useState('Follow route');
  const [directionDistance, setDirectionDistance] = useState<string>('—');
  const [directionsApiFailed, setDirectionsApiFailed] = useState(false);
  const [directionsUseWaypoints, setDirectionsUseWaypoints] = useState(true);
  const [studentStops, setStudentStops] = useState<any[]>([]);
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
  const mockIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mockRouteIndexRef = useRef(0);
  const mockRouteProgressRef = useRef(0);
  const lastLocationSendRef = useRef<number>(0);
  const mapRef = useRef<MapView>(null);
  const LOCATION_SEND_INTERVAL_MS = 10000; // Throttle: send to server every 10s (API guide: 5-10s recommended)

  // =================== DEV MOCK LOCATION ===================
  // Set USE_MOCK_LOCATION = true to test with US coordinates from Pakistan
  // Set to false for production / real GPS
  const USE_MOCK_LOCATION = true; // Set to (__DEV__ && true) for mock US coords during testing
  const MOCK_LOCATION = {
    latitude: 33.8682032,
    longitude: -118.2614261,
    speed: 45,
    heading: 90,
  };
  const FORCED_DROPOFF = {
    latitude: 33.8612660793255,
    longitude: -118.2547184017843,
  };
  // ==========================================================

  const gpsFixReceivedRef = useRef(false);
  const gpsFallbackTriedRef = useRef(false);
  const gpsPollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gpsNoFixTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isStartingTrackingRef = useRef(false);

  const route = useRoute();
  const isFromMapView =
    (route.params as any)?.FromMapView ?? (route.params as any)?.fromMapView ?? false;
  const inspectionSelectedIssueIds = Array.isArray(
    (route.params as any)?.inspectionSelectedIssueIds,
  )
    ? (route.params as any)?.inspectionSelectedIssueIds
    : [];
  const inspectionNotes =
    typeof (route.params as any)?.inspectionNotes === 'string'
      ? (route.params as any)?.inspectionNotes
      : '';
  const inspectionReportId = (route.params as any)?.inspectionReportId ?? null;

  // Retail mode: coordinates passed directly from TripCard
  const retailPickupLat = (route.params as any)?.retailPickupLat ?? null;
  const retailPickupLong = (route.params as any)?.retailPickupLong ?? null;
  const retailDropoffLat = (route.params as any)?.retailDropoffLat ?? null;
  const retailDropoffLong = (route.params as any)?.retailDropoffLong ?? null;
  const isRetailMode =
    retailPickupLat != null && retailPickupLong != null &&
    retailDropoffLat != null && retailDropoffLong != null;

  useEffect(() => {
    if (__DEV__ && route?.params != null) {
      console.log('Route params:', route.params);
    }
  }, [route?.params]);

  const role = useAppSelector(state => state.userSlices.role);
  const token = useAppSelector(state => state.userSlices.token);
  const employeeId = useAppSelector(state => state.userSlices.employeeId);
  const tokenVehicleId = useAppSelector(state => (state as any).userSlices.vehicleId);
  // routeId + tripId from routes-by-date API (preferred) or JWT fallback
  const activeRouteId = useAppSelector(state => (state as any).driverSlices.activeRouteId);
  const activeTripId = useAppSelector(state => (state as any).driverSlices.activeTripId);
  const routeStarted = useAppSelector(state => (state as any).driverSlices.routeStarted);
  const tokenRouteId = useAppSelector(state => (state as any).userSlices.routeId);
  const tokenTripId = useAppSelector(state => (state as any).userSlices.tripId);
  const routesByDate = useAppSelector(state => (state as any).driverSlices.routesByDate);
  const fallbackRouteIdFromRoutes = useMemo(() => {
    const morning = Array.isArray(routesByDate?.morning) ? routesByDate.morning : [];
    const evening = Array.isArray(routesByDate?.evening) ? routesByDate.evening : [];
    const firstRoute = morning[0] ?? evening[0] ?? null;
    return firstRoute?.RouteId ?? firstRoute?.routeId ?? null;
  }, [routesByDate]);
  const effectiveRouteId =
    activeRouteId ?? tokenRouteId ?? fallbackRouteIdFromRoutes;
  const effectiveTripId = activeTripId ?? tokenTripId;
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

  const defaultStartLocation = {
    latitude: 37.7749,
    longitude: -122.4454,
  };

  const defaultEndLocation = {
    latitude: 37.7793,
    longitude: -122.426,
  };

  const routeCoordinates = useMemo(() => {
    const pickNumber = (obj: any, keys: string[]) => {
      for (const key of keys) {
        const raw = obj?.[key];
        const num = raw != null ? Number(raw) : null;
        if (num != null && Number.isFinite(num)) return num;
      }
      return null;
    };
    const parsePath = (routeObj: any): Array<{latitude: number; longitude: number}> => {
      const candidateKeys = [
        'RoutePath',
        'routePath',
        'Path',
        'path',
        'RouteCoordinates',
        'routeCoordinates',
        'Coordinates',
        'coordinates',
      ];
      let raw: any = null;
      for (const key of candidateKeys) {
        if (routeObj?.[key] != null) {
          raw = routeObj[key];
          break;
        }
      }
      if (raw == null) return [];
      let list: any = raw;
      if (typeof list === 'string') {
        try {
          list = JSON.parse(list);
        } catch {
          return [];
        }
      }
      if (!Array.isArray(list)) return [];
      return list
        .map((item: any) => {
          const lat = pickNumber(item, ['latitude', 'Latitude', 'lat', 'Lat']);
          const lng = pickNumber(item, ['longitude', 'Longitude', 'lng', 'Lng', 'lon', 'Lon']);
          if (lat == null || lng == null) return null;
          return {latitude: lat, longitude: lng};
        })
        .filter(Boolean) as Array<{latitude: number; longitude: number}>;
    };
    const morning = Array.isArray(routesByDate?.morning) ? routesByDate.morning : [];
    const evening = Array.isArray(routesByDate?.evening) ? routesByDate.evening : [];
    const allRoutes = [...morning, ...evening];

    const targetRoute =
      allRoutes.find((r: any) => Number(r?.RouteId) === Number(effectiveRouteId)) ??
      allRoutes.find(
        (r: any) =>
          r?.PickupLatitude != null &&
          r?.PickupLongitude != null &&
          r?.DropoffLatitude != null &&
          r?.DropoffLongitude != null,
      ) ??
      null;

    const pickupLat = pickNumber(targetRoute, [
      'PickupLatitude',
      'pickupLatitude',
      'pickupLat',
      'StartLatitude',
      'startLatitude',
      'FromLatitude',
      'fromLatitude',
    ]);
    const pickupLng = pickNumber(targetRoute, [
      'PickupLongitude',
      'pickupLongitude',
      'pickupLng',
      'StartLongitude',
      'startLongitude',
      'FromLongitude',
      'fromLongitude',
    ]);
    const dropoffLat = pickNumber(targetRoute, [
      'DropoffLatitude',
      'dropoffLatitude',
      'dropoffLat',
      'EndLatitude',
      'endLatitude',
      'ToLatitude',
      'toLatitude',
    ]);
    const dropoffLng = pickNumber(targetRoute, [
      'DropoffLongitude',
      'dropoffLongitude',
      'dropoffLng',
      'EndLongitude',
      'endLongitude',
      'ToLongitude',
      'toLongitude',
    ]);

    const hasPickup =
      pickupLat != null && pickupLng != null && Number.isFinite(pickupLat) && Number.isFinite(pickupLng);
    const hasDropoff =
      dropoffLat != null &&
      dropoffLng != null &&
      Number.isFinite(dropoffLat) &&
      Number.isFinite(dropoffLng);

    const apiPath = parsePath(targetRoute);
    return {
      pickup: hasPickup ? {latitude: pickupLat, longitude: pickupLng} : null,
      dropoff: hasDropoff ? {latitude: dropoffLat, longitude: dropoffLng} : null,
      hasValidRoute: hasPickup && hasDropoff,
      path: apiPath,
    };
  }, [routesByDate, effectiveRouteId]);
  const canRenderDirections =
    !!googleMapsApiKey &&
    (isRetailMode || (routeCoordinates.hasValidRoute && !!routeCoordinates.pickup && !!routeCoordinates.dropoff));
  const routeOrigin = useMemo(() => {
    if (isRetailMode) return {latitude: Number(retailPickupLat), longitude: Number(retailPickupLong)};
    return routeCoordinates.pickup ?? null;
  }, [isRetailMode, retailPickupLat, retailPickupLong, routeCoordinates.pickup]);
  const routeDestination = useMemo(() => {
    if (isRetailMode) return {latitude: Number(retailDropoffLat), longitude: Number(retailDropoffLong)};
    return FORCED_DROPOFF ?? routeCoordinates.dropoff ?? null;
  }, [isRetailMode, retailDropoffLat, retailDropoffLong, routeCoordinates.dropoff]);
  const parseStudentCoord = (student: any, kind: 'pickup' | 'dropoff') => {
    const directLatKeys =
      kind === 'pickup'
        ? ['pickupLatitude', 'PickupLatitude', 'pickupLat', 'PickupLat', 'latitude', 'Latitude', 'lat', 'Lat']
        : ['dropoffLatitude', 'DropoffLatitude', 'dropoffLat', 'DropoffLat', 'latitude', 'Latitude', 'lat', 'Lat'];
    const directLngKeys =
      kind === 'pickup'
        ? ['pickupLongitude', 'PickupLongitude', 'pickupLng', 'PickupLng', 'longitude', 'Longitude', 'lng', 'Lng', 'lon', 'Lon']
        : ['dropoffLongitude', 'DropoffLongitude', 'dropoffLng', 'DropoffLng', 'longitude', 'Longitude', 'lng', 'Lng', 'lon', 'Lon'];
    const nested = kind === 'pickup' ? student?.pickupLocation : student?.dropoffLocation;
    const getNum = (obj: any, keys: string[]) => {
      for (const key of keys) {
        const raw = obj?.[key];
        const num = raw != null ? Number(raw) : null;
        if (num != null && Number.isFinite(num)) return num;
      }
      return null;
    };
    const lat = getNum(student, directLatKeys) ?? getNum(nested, ['latitude', 'Latitude', 'lat', 'Lat']);
    const lng =
      getNum(student, directLngKeys) ??
      getNum(nested, ['longitude', 'Longitude', 'lng', 'Lng', 'lon', 'Lon']);
    if (lat == null || lng == null) return null;
    return {latitude: lat, longitude: lng};
  };
  const routePickupPoints = useMemo(() => {
    return studentStops
      .map((student: any) => {
        const point = parseStudentCoord(student, 'pickup');
        if (!point) return null;
        return {
          latitude: point.latitude,
          longitude: point.longitude,
          name: String(student?.name ?? ''),
        };
      })
      .filter(Boolean) as Array<{latitude: number; longitude: number; name: string}>;
  }, [studentStops]);
  const routeWaypoints = useMemo(() => {
    // Ensure route passes through all student pickup points before dropoff.
    return routePickupPoints.map(point => ({
      latitude: point.latitude,
      longitude: point.longitude,
    }));
  }, [routePickupPoints]);
  const studentDropoffPoints = useMemo(() => {
    return studentStops
      .map((student: any) => {
        const point = parseStudentCoord(student, 'dropoff');
        if (!point) return null;
        return {
          latitude: point.latitude,
          longitude: point.longitude,
          name: String(student?.name ?? ''),
        };
      })
      .filter(Boolean) as Array<{latitude: number; longitude: number; name: string}>;
  }, [studentStops]);
  const canRenderOptimizedDirections =
    !!googleMapsApiKey && !!routeOrigin && !!routeDestination;
  const fallbackOrigin = routeCoordinates.pickup ?? null;
  const fallbackDestination = routeCoordinates.dropoff ?? null;
  const fallbackPolylineCoords = useMemo(() => {
    if (Array.isArray(routeCoordinates.path) && routeCoordinates.path.length >= 2) {
      return routeCoordinates.path;
    }
    const from = routeOrigin ?? fallbackOrigin;
    const to = routeDestination ?? fallbackDestination;
    if (!from || !to) return [];
    return [from, ...routeWaypoints, to];
  }, [
    routeCoordinates.path,
    routeOrigin,
    routeDestination,
    routeWaypoints,
    fallbackOrigin,
    fallbackDestination,
  ]);
  const routePolylineCoords = useMemo(() => {
    if (fallbackPolylineCoords.length >= 2) return fallbackPolylineCoords;
    return [];
  }, [fallbackPolylineCoords]);
  const mappedStudentMarkers = useMemo(() => {
    if (routePolylineCoords.length < 2) return routePickupPoints;
    const nearestPointOnRoute = (point: {latitude: number; longitude: number}) => {
      let nearest = routePolylineCoords[0];
      let best = Number.POSITIVE_INFINITY;
      for (let i = 0; i < routePolylineCoords.length - 1; i++) {
        const a = routePolylineCoords[i];
        const b = routePolylineCoords[i + 1];
        const abx = b.latitude - a.latitude;
        const aby = b.longitude - a.longitude;
        const apx = point.latitude - a.latitude;
        const apy = point.longitude - a.longitude;
        const denom = abx * abx + aby * aby || 1;
        const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / denom));
        const proj = {
          latitude: a.latitude + t * abx,
          longitude: a.longitude + t * aby,
        };
        const dx = point.latitude - proj.latitude;
        const dy = point.longitude - proj.longitude;
        const d = dx * dx + dy * dy;
        if (d < best) {
          best = d;
          nearest = proj;
        }
      }
      return nearest;
    };
    return routePickupPoints.map(p => {
      const snapped = nearestPointOnRoute({latitude: p.latitude, longitude: p.longitude});
      return {...p, latitude: snapped.latitude, longitude: snapped.longitude};
    });
  }, [routePolylineCoords, routePickupPoints]);
  const fallbackDirection = useMemo(() => {
    if (routeWaypoints.length > 0) {
      return {hint: 'Proceed to next pickup point', distance: '—'};
    }
    if (fallbackPolylineCoords.length >= 2) {
      return {hint: 'Proceed on assigned route', distance: '—'};
    }
    return {hint: 'Follow route', distance: '—'};
  }, [routeWaypoints.length, fallbackPolylineCoords.length]);
  const shouldUseFallbackDirections =
    !canRenderOptimizedDirections || directionsApiFailed;

  useEffect(() => {
    if (shouldUseFallbackDirections) {
      setDirectionHint(fallbackDirection.hint);
    }
  }, [shouldUseFallbackDirections, fallbackDirection]);

  useEffect(() => {
    mockRouteIndexRef.current = 0;
    mockRouteProgressRef.current = 0;
  }, [routePolylineCoords]);

  useEffect(() => {
    // Retry Google Directions when route inputs change
    setDirectionsApiFailed(false);
    setDirectionsUseWaypoints(true);
  }, [routeOrigin, routeDestination, routeWaypoints.length]);

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

  useEffect(() => {
    if (!shouldUseFallbackDirections) return;
    if (!currentVehicleLocation || routePickupPoints.length === 0) {
      setDirectionDistance('—');
      return;
    }
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const haversineKm = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number,
    ) => {
      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };
    let minKm = Number.POSITIVE_INFINITY;
    for (const p of routePickupPoints) {
      const km = haversineKm(
        currentVehicleLocation.latitude,
        currentVehicleLocation.longitude,
        p.latitude,
        p.longitude,
      );
      if (km < minKm) minKm = km;
    }
    if (!Number.isFinite(minKm)) {
      setDirectionDistance('—');
      return;
    }
    setDirectionHint('Proceed to next pickup point');
    setDirectionDistance(minKm < 1 ? `${Math.round(minKm * 1000)} m` : `${minKm.toFixed(1)} km`);
  }, [shouldUseFallbackDirections, currentVehicleLocation, routePickupPoints]);

  // Use vehicle location if available, otherwise use default
  const mapCenter = currentVehicleLocation || {
    latitude:
      routeCoordinates.hasValidRoute && routeCoordinates.pickup && routeCoordinates.dropoff
        ? (routeCoordinates.pickup.latitude + routeCoordinates.dropoff.latitude) / 2
        : (defaultStartLocation.latitude + defaultEndLocation.latitude) / 2,
    longitude:
      routeCoordinates.hasValidRoute && routeCoordinates.pickup && routeCoordinates.dropoff
        ? (routeCoordinates.pickup.longitude + routeCoordinates.dropoff.longitude) / 2
        : (defaultStartLocation.longitude + defaultEndLocation.longitude) / 2,
  };

  const mapRegion = useMemo(
    () => ({
      latitude: mapCenter.latitude,
      longitude: mapCenter.longitude,
      latitudeDelta: currentVehicleLocation
        ? 0.01
        : routeCoordinates.hasValidRoute && routeCoordinates.pickup && routeCoordinates.dropoff
        ? Math.abs(routeCoordinates.pickup.latitude - routeCoordinates.dropoff.latitude) *
            1.5 || 0.05
        : Math.abs(defaultStartLocation.latitude - defaultEndLocation.latitude) * 1.5 || 0.05,
      longitudeDelta: currentVehicleLocation
        ? 0.01
        : routeCoordinates.hasValidRoute && routeCoordinates.pickup && routeCoordinates.dropoff
        ? Math.abs(routeCoordinates.pickup.longitude - routeCoordinates.dropoff.longitude) *
            1.5 || 0.05
        : Math.abs(defaultStartLocation.longitude - defaultEndLocation.longitude) * 1.5 || 0.05,
    }),
    [
      mapCenter.latitude,
      mapCenter.longitude,
      currentVehicleLocation != null,
      routeCoordinates.hasValidRoute,
      routeCoordinates.pickup?.latitude,
      routeCoordinates.pickup?.longitude,
      routeCoordinates.dropoff?.latitude,
      routeCoordinates.dropoff?.longitude,
      defaultStartLocation.latitude,
      defaultStartLocation.longitude,
      defaultEndLocation.latitude,
      defaultEndLocation.longitude,
    ],
  );

  // Live tracking: follow driver when GPS updates
  useEffect(() => {
    if (
      USE_MOCK_LOCATION ||
      !currentGpsLocation?.latitude ||
      !currentGpsLocation?.longitude ||
      !mapRef.current
    )
      return;
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
      {/* Pickup -> Dropoff route line from routes/by-date coordinates */}
      {canRenderOptimizedDirections || routePolylineCoords.length >= 2 ? (
          <>
            {canRenderOptimizedDirections && !directionsApiFailed ? (
              <MapViewDirections
                origin={routeOrigin}
                destination={routeDestination}
                waypoints={
                  directionsUseWaypoints && routeWaypoints.length > 0
                    ? routeWaypoints.slice(0, 10)
                    : undefined
                }
                apikey={googleMapsApiKey}
                strokeWidth={4}
                strokeColor={AppColors.red}
                optimizeWaypoints={directionsUseWaypoints}
                onReady={result => {
                  setDirectionsApiFailed(false);
                  const firstLeg: any =
                    Array.isArray((result as any)?.legs) && (result as any).legs.length > 0
                      ? (result as any).legs[0]
                      : null;
                  const firstStep: any =
                    firstLeg && Array.isArray(firstLeg?.steps) && firstLeg.steps.length > 0
                      ? firstLeg.steps[0]
                      : null;
                  const htmlInstruction =
                    String(firstStep?.html_instructions ?? firstStep?.maneuver ?? '').trim();
                  const plainInstruction = htmlInstruction
                    ? htmlInstruction.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
                    : '';
                  setDirectionHint(plainInstruction || 'Proceed on assigned route');
                  const stepDistanceText =
                    String(firstStep?.distance?.text ?? firstLeg?.distance?.text ?? '').trim();
                  const totalDistanceText =
                    Number.isFinite(Number((result as any)?.distance))
                      ? `${Number((result as any).distance).toFixed(1)} km`
                      : '';
                  setDirectionDistance(stepDistanceText || totalDistanceText || '—');
                  mapRef.current?.fitToCoordinates(result.coordinates, {
                    edgePadding: {top: hp(6), right: hp(6), bottom: hp(24), left: hp(6)},
                    animated: true,
                  });
                }}
                onError={error => {
                  if (__DEV__) {
                    const rawError = String(error ?? '');
                    const normalized = rawError.toUpperCase();
                    const reason =
                      normalized.includes('REQUEST_DENIED')
                        ? 'REQUEST_DENIED (API key restriction/billing)'
                        : normalized.includes('OVER_QUERY_LIMIT')
                        ? 'OVER_QUERY_LIMIT (quota exceeded)'
                        : normalized.includes('API_KEY')
                        ? 'API_KEY issue (missing/invalid)'
                        : normalized.includes('BILLING')
                        ? 'BILLING_DISABLED'
                        : normalized.includes('NOT AUTHORIZED')
                        ? 'NOT_AUTHORIZED for Directions API'
                        : 'UNKNOWN';
                    console.warn('🧭 Google Directions failed:', {
                      reason,
                      rawError,
                      googleMapsApiKeyPresent: !!googleMapsApiKey,
                      usingWaypoints: directionsUseWaypoints,
                      waypointCount: routeWaypoints.length,
                      origin: routeOrigin,
                      destination: routeDestination,
                    });
                  }
                  if (directionsUseWaypoints && routeWaypoints.length > 0) {
                    // Retry once without waypoints (Google rejects some waypoint payloads/limits).
                    if (__DEV__) {
                      console.warn(
                        'MapViewDirections waypoint request failed, retrying without waypoints:',
                        error,
                      );
                    }
                    setDirectionsUseWaypoints(false);
                    setDirectionHint('Recalculating route...');
                    setDirectionDistance('—');
                    return;
                  }
                  setDirectionsApiFailed(true);
                  setDirectionHint(fallbackDirection.hint);
                  setDirectionDistance(fallbackDirection.distance);
                  if (__DEV__) {
                    console.warn('MapViewDirections error (DriverMapView):', error);
                  }
                }}
              />
            ) : (
              <Polyline
                coordinates={
                  routePolylineCoords
                }
                strokeColor={AppColors.red}
                strokeWidth={4}
              />
            )}
            {routeOrigin ? (
              <Marker
                coordinate={routeOrigin}
                pinColor="#1FA971"
                title="Start Point"
                description="Route start point"
              />
            ) : fallbackOrigin ? (
              <Marker
                coordinate={fallbackOrigin}
                pinColor="#1FA971"
                title="Start Point"
                description="Route start point"
              />
            ) : null}
            {routeDestination ? (
              <Marker
                coordinate={routeDestination}
                pinColor="#C62828"
                title="Dropoff Point"
                description="Route end point"
              />
            ) : fallbackDestination ? (
              <Marker
                coordinate={fallbackDestination}
                pinColor="#C62828"
                title="Dropoff Point"
                description="Route end point"
              />
            ) : null}
          </>
        ) : null}
      {mappedStudentMarkers.map((point, idx) => (
        <Marker
          key={`student_pick_${idx}`}
          coordinate={{latitude: point.latitude, longitude: point.longitude}}
          pinColor="#1E88E5"
          title={point.name || `Student ${idx + 1}`}
        />
      ))}
      {/* Keep only one destination marker to avoid duplicate red dropoff pins */}
      {/* Vehicle Location Marker - live GPS when available */}
      {currentVehicleLocation && (
        <Marker
          coordinate={currentVehicleLocation}
          anchor={{x: 0.5, y: 0.5}}
          tracksViewChanges={false}
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
    [
      mapRegion,
      currentVehicleLocation,
      currentGpsLocation,
      mapRef,
      routeCoordinates,
      routeOrigin,
      routeDestination,
      routeWaypoints,
      routePolylineCoords,
      mappedStudentMarkers,
      routePickupPoints,
      studentDropoffPoints,
      directionsUseWaypoints,
      setDirectionHint,
      setDirectionDistance,
    ],
  );

  useEffect(() => {
    const fetchRouteStudents = async () => {
      if (!token) return;
      try {
        const baseUrl = getApiBaseUrl();
        const endpoint = `${baseUrl}/driver/students`;
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        if (!response.ok) return;
        const data = await response.json().catch(() => null);
        const list = Array.isArray(data?.data) ? data.data : [];
        setStudentStops(list);
      } catch (e) {
        // ignore
      }
    };
    fetchRouteStudents();
  }, [token, effectiveRouteId]);

  const fetchOnBoardSummary = useCallback(async () => {
    if (!token || !effectiveRouteId) return;
    try {
      const baseUrl = getApiBaseUrl();
      const types: Array<'AM' | 'PM'> = ['AM', 'PM'];
      let bestSummary: any = null;
      let bestScore = -1;
      for (const type of types) {
        const endpoint = `${baseUrl}/tracking/routes/${effectiveRouteId}/students/onboard?type=${type}`;
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        if (!response.ok) continue;
        const data = await response.json().catch(() => null);
        const summary = data?.data ?? null;
        if (!summary) continue;
        const score = Number(summary?.onBoardCount ?? 0) * 1000 + Number(summary?.totalStudents ?? 0);
        if (score > bestScore) {
          bestScore = score;
          bestSummary = summary;
        }
      }
      if (bestSummary) {
        setOnBoardCount(Number(bestSummary?.onBoardCount ?? 0));
        setTotalStudentsCount(Number(bestSummary?.totalStudents ?? 0));
      }
    } catch (e) {
      // keep old values
    }
  }, [token, effectiveRouteId]);

  useEffect(() => {
    if (!isFocused) return;
    fetchOnBoardSummary();
    const interval = setInterval(fetchOnBoardSummary, 6000);
    return () => clearInterval(interval);
  }, [isFocused, fetchOnBoardSummary]);

  useEffect(() => {
    if (showStartMileAgeSheet) {
      openSheet();
    }
  }, [showStartMileAgeSheet]);

  // Fetch driver details (backend auto-resolves from JWT, no employeeId needed)
  useEffect(() => {
    if (role !== 'Driver') return;
    if (tokenVehicleId) return; // Prefer token vehicleId; avoid extra network call
    if (__DEV__) console.log('📞 Fetching driver details...');
    dispatch(fetchDriverDetails());
  }, [dispatch, role, tokenVehicleId]);

  // Fetch today's routes to get routeId + tripId
  useEffect(() => {
    if (role !== 'Driver') return;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    if (__DEV__) console.log('📅 Fetching routes for date:', today);
    dispatch(fetchRoutesByDate(today));
  }, [dispatch, role]);

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

  const getNextMockLocation = useCallback(() => {
    const path = routePolylineCoords;
    if (!Array.isArray(path) || path.length === 0) {
      return {
        latitude: MOCK_LOCATION.latitude,
        longitude: MOCK_LOCATION.longitude,
        speed: MOCK_LOCATION.speed,
        heading: MOCK_LOCATION.heading,
      };
    }
    if (path.length === 1) {
      return {
        latitude: path[0].latitude,
        longitude: path[0].longitude,
        speed: MOCK_LOCATION.speed,
        heading: MOCK_LOCATION.heading,
      };
    }

    // Move along route segments smoothly; when route ends, loop from start.
    let index = mockRouteIndexRef.current;
    let progress = mockRouteProgressRef.current;
    const segmentStep = 0.18;
    progress += segmentStep;
    while (progress >= 1) {
      progress -= 1;
      index += 1;
      if (index >= path.length - 1) {
        index = 0;
      }
    }
    mockRouteIndexRef.current = index;
    mockRouteProgressRef.current = progress;

    const from = path[index];
    const to = path[index + 1] ?? path[0];
    const latitude = from.latitude + (to.latitude - from.latitude) * progress;
    const longitude = from.longitude + (to.longitude - from.longitude) * progress;
    const dy = to.latitude - from.latitude;
    const dx = to.longitude - from.longitude;
    const heading = (Math.atan2(dx, dy) * 180) / Math.PI;

    return {
      latitude,
      longitude,
      speed: MOCK_LOCATION.speed,
      heading: Number.isFinite(heading) ? (heading + 360) % 360 : MOCK_LOCATION.heading,
    };
  }, [routePolylineCoords]);

  // Start GPS location tracking (MANDATORY - permission required)
  const startLocationTracking = useCallback(() => {
    if (!vehicleId) {
      if (__DEV__) console.warn('❌ Cannot start location tracking: vehicleId is missing');
      return;
    }
    if (USE_MOCK_LOCATION) {
      if (!routeStarted) {
        setCurrentGpsLocation({
          latitude: MOCK_LOCATION.latitude,
          longitude: MOCK_LOCATION.longitude,
          speed: 0,
          heading: MOCK_LOCATION.heading,
        });
        if (__DEV__) console.log('🧪 Mock GPS paused (trip not started)');
        return;
      }
      if (mockIntervalRef.current) return;
      setHasLocationPermission(true);
      setIsLocationServiceEnabled(true);
      const sendMockTick = () => {
        const point = getNextMockLocation();
        const timestamp = new Date().toISOString();
        setCurrentGpsLocation(point);
        const now = Date.now();
        if (now - lastLocationSendRef.current >= LOCATION_SEND_INTERVAL_MS) {
          lastLocationSendRef.current = now;
          dispatch(
            updateVehicleLocation({
              vehicleId,
              latitude: point.latitude,
              longitude: point.longitude,
              speed: point.speed ?? undefined,
              heading: point.heading ?? undefined,
              timestamp,
              routeId: effectiveRouteId ?? undefined,
              tripId: effectiveTripId ?? undefined,
            }),
          );
        }
      };
      sendMockTick();
      mockIntervalRef.current = setInterval(sendMockTick, 2000);
      if (__DEV__) console.log('🧪 Mock GPS tracking started');
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
          const rawCoords = position.coords;
          // Use mock location in dev if enabled, otherwise real GPS
          const finalLat = USE_MOCK_LOCATION ? MOCK_LOCATION.latitude : rawCoords.latitude;
          const finalLng = USE_MOCK_LOCATION ? MOCK_LOCATION.longitude : rawCoords.longitude;
          const finalSpeed = USE_MOCK_LOCATION ? MOCK_LOCATION.speed : rawCoords.speed;
          const finalHeading = USE_MOCK_LOCATION ? MOCK_LOCATION.heading : rawCoords.heading;
          const timestamp = new Date().toISOString();
          setIsLocationServiceEnabled(true);
          if (!gpsFixReceivedRef.current) {
            gpsFixReceivedRef.current = true;
            if (gpsNoFixTimerRef.current) {
              clearTimeout(gpsNoFixTimerRef.current);
              gpsNoFixTimerRef.current = null;
            }
            if (__DEV__) {
              console.log('📡 GPS FIX RECEIVED:', {latitude: finalLat, longitude: finalLng, mock: USE_MOCK_LOCATION});
            }
          }

          // Update local state every time (smooth map pin)
          setCurrentGpsLocation({
            latitude: finalLat,
            longitude: finalLng,
            speed: finalSpeed ?? undefined,
            heading: finalHeading ?? undefined,
          });

          // Send to server only when throttled (battery + network)
          const now = Date.now();
          if (now - lastLocationSendRef.current >= LOCATION_SEND_INTERVAL_MS) {
            lastLocationSendRef.current = now;
            dispatch(
              updateVehicleLocation({
                vehicleId,
                latitude: finalLat,
                longitude: finalLng,
                speed: finalSpeed ?? undefined,
                heading: finalHeading ?? undefined,
                timestamp,
                routeId: effectiveRouteId ?? undefined,
                tripId: effectiveTripId ?? undefined,
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
            const rawLat = pos.coords.latitude;
            const rawLng = pos.coords.longitude;
            const rawSp = pos.coords.speed;
            const rawHd = pos.coords.heading;
            // Use mock location in dev if enabled
            const lat = USE_MOCK_LOCATION ? MOCK_LOCATION.latitude : rawLat;
            const lng = USE_MOCK_LOCATION ? MOCK_LOCATION.longitude : rawLng;
            const sp = USE_MOCK_LOCATION ? MOCK_LOCATION.speed : rawSp;
            const hd = USE_MOCK_LOCATION ? MOCK_LOCATION.heading : rawHd;
            gpsFixReceivedRef.current = true;
            setIsLocationServiceEnabled(true);
            if (__DEV__) {
              console.log('📡 GPS POLL FIX:', {latitude: lat, longitude: lng, mock: USE_MOCK_LOCATION});
            }
            setCurrentGpsLocation({
              latitude: lat,
              longitude: lng,
              speed: sp ?? undefined,
              heading: hd ?? undefined,
            });

            // Also send to server from poll (watchPosition may not fire)
            const pollTimestamp = new Date().toISOString();
            const pollNow = Date.now();
            if (pollNow - lastLocationSendRef.current >= LOCATION_SEND_INTERVAL_MS) {
              lastLocationSendRef.current = pollNow;
              dispatch(
                updateVehicleLocation({
                  vehicleId,
                  latitude: lat,
                  longitude: lng,
                  speed: sp ?? undefined,
                  heading: hd ?? undefined,
                  timestamp: pollTimestamp,
                  routeId: effectiveRouteId ?? undefined,
                  tripId: effectiveTripId ?? undefined,
                }),
              ).then((result: any) => {
                if (__DEV__) {
                  if (result.type === 'driver/updateVehicleLocation/fulfilled') {
                    console.log('✅ Location sent to server (from poll)');
                  } else if (result.type === 'driver/updateVehicleLocation/rejected') {
                    console.warn('❌ Send location failed (from poll):', result.payload || result.error);
                  }
                }
              });
            }

            // Don't stop polling — keep sending until watchPosition takes over
          },
          error => {
            if (__DEV__) {
              console.warn('📡 GPS POLL ERROR:', {
                code: (error as any)?.code,
                message: (error as any)?.message,
              });
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
      // Keep polling every 15s to continuously send location to server
      if (!gpsPollIntervalRef.current) {
        gpsPollIntervalRef.current = setInterval(pollOnce, 15000);
      }
    });
  }, [
    vehicleId,
    dispatch,
    requestLocationPermission,
    hasLocationPermission,
    effectiveRouteId,
    effectiveTripId,
    getNextMockLocation,
    routeStarted,
  ]);

  // Stop GPS location tracking
  const stopLocationTracking = useCallback(() => {
    if (mockIntervalRef.current) {
      clearInterval(mockIntervalRef.current);
      mockIntervalRef.current = null;
    }
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
    openSheet();
  }, [ensureDriverCanStartTrip, openSheet]);

  useEffect(() => {
    // Keep local CTA state in sync with persisted route start state.
    setTripStarted(!!routeStarted);
  }, [routeStarted]);

  const handleStartRouteSubmit = useCallback(async () => {
    if (!token) {
      Alert.alert('Error', 'Not authenticated');
      return;
    }
    if (!effectiveRouteId) {
      if (__DEV__) {
        console.warn('❌ Start route blocked: routeId missing', {
          activeRouteId,
          tokenRouteId,
          fallbackRouteIdFromRoutes,
          routesByDate,
        });
      }
      Alert.alert('Error', 'Route not found');
      return;
    }
    if (!vehicleId) {
      Alert.alert('Error', 'Vehicle not found');
      return;
    }
    try {
      const baseUrl = getApiBaseUrl();
      const endpoint = `${baseUrl}/driver/routes/${effectiveRouteId}/start`;
      const body: any = {
        vehicleId: Number(vehicleId),
        selectedIssueIds: inspectionSelectedIssueIds,
        notes: inspectionNotes,
      };
      const mileageNumber = Number(startMileage);
      if (startMileage.trim() && Number.isFinite(mileageNumber)) {
        body.startMileage = mileageNumber;
      }
      if (inspectionReportId != null) {
        body.inspectionReportId = inspectionReportId;
      }

      if (__DEV__) {
        console.log('📡 POST /driver/routes/:routeId/start URL:', endpoint);
        console.log('📤 POST /driver/routes/:routeId/start BODY:', body);
      }

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
        if (__DEV__) {
          console.warn(
            '❌ POST /driver/routes/:routeId/start failed:',
            response.status,
            responseText,
          );
        }
        Alert.alert('Start Failed', responseText || 'Could not start route');
        return;
      }
      if (__DEV__) {
        console.log('✅ POST /driver/routes/:routeId/start success:', responseText);
      }
      dispatch(setActiveRouteId(effectiveRouteId));
      dispatch(setRouteStarted(true));
      setTripStarted(true);
      closeSheet();
    } catch (e) {
      if (__DEV__) {
        console.warn('❌ POST /driver/routes/:routeId/start network error:', e);
      }
      Alert.alert('Error', 'Network error while starting route');
    }
  }, [
    token,
    effectiveRouteId,
    activeRouteId,
    tokenRouteId,
    fallbackRouteIdFromRoutes,
    routesByDate,
    vehicleId,
    inspectionSelectedIssueIds,
    inspectionNotes,
    startMileage,
    inspectionReportId,
    closeSheet,
  ]);

  const handleEndRouteSubmit = useCallback(async () => {
    if (!token) {
      Alert.alert('Error', 'Not authenticated');
      return;
    }
    if (!effectiveRouteId) {
      Alert.alert('Error', 'Route not found');
      return;
    }
    try {
      const baseUrl = getApiBaseUrl();
      const endpoint = `${baseUrl}/driver/routes/${effectiveRouteId}/end`;
      const body: any = {};
      const mileageNumber = Number(startMileage);
      if (startMileage.trim() && Number.isFinite(mileageNumber)) {
        body.endMileage = mileageNumber;
      }

      if (__DEV__) {
        console.log('📡 POST /driver/routes/:routeId/end URL:', endpoint);
        console.log('📤 POST /driver/routes/:routeId/end BODY:', body);
      }

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
        if (__DEV__) {
          console.warn(
            '❌ POST /driver/routes/:routeId/end failed:',
            response.status,
            responseText,
          );
        }
        Alert.alert('End Failed', responseText || 'Could not end route');
        return;
      }
      if (__DEV__) {
        console.log('✅ POST /driver/routes/:routeId/end success:', responseText);
      }
      dispatch(setActiveRouteId(null));
      dispatch(setRouteStarted(false));
      showSuccessToast('Success', 'Route ended successfully');
      closeSheet();
      setTripStarted(false);
      navigation.navigate('DriverHomeScreen');
    } catch (e) {
      if (__DEV__) {
        console.warn('❌ POST /driver/routes/:routeId/end network error:', e);
      }
      Alert.alert('Error', 'Network error while ending route');
    }
  }, [token, effectiveRouteId, startMileage, closeSheet, navigation, dispatch]);

  // Start location tracking only when trip has started.
  useEffect(() => {
    if (
      vehicleId &&
      role === 'Driver' &&
      hasLocationPermission === true &&
      routeStarted
    ) {
      startLocationTracking();
    } else if (role === 'Driver') {
      stopLocationTracking();
    }
    return () => {
      stopLocationTracking();
    };
  }, [
    vehicleId,
    role,
    hasLocationPermission,
    routeStarted,
    startLocationTracking,
    stopLocationTracking,
  ]);

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
         
        </Pressable>

        <View style={[styles.absoluteContainer]}>
          <View style={[AppStyles.rowBetween, {alignItems: 'flex-end'}]}>
            <View style={styles.tripInfoColumn}>
              <View style={styles.firstContainer}>
                <Text style={styles.boardTitle}>Trip# 03</Text>
                <Text style={styles.boardTitle}>Students on board</Text>
                {/* <Text style={styles.boardTitle}>on board:</Text> */}
                <Text style={styles.boardDate}>
                  {`${onBoardCount} / ${totalStudentsCount}`}
                </Text>
              </View>
              {!endTrip && (
                <View style={styles.distanceContainer}>
                  <View style={AppStyles.row}>
                    <GlobalIcon
                      library="MaterialCommunityIcons"
                      name="arrow-right-top-bold"
                    />
                    <Text
                      style={styles.boardDate}
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      {directionDistance}
                    </Text>
                  </View>
                  <Text
                    style={AppStyles.whiteSubTitle}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {directionHint}
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
            value={startMileage}
            onChangeText={setStartMileage}
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
                  handleEndRouteSubmit();
                } else {
                  handleStartRouteSubmit();
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
    width: '100%',
  },
  tripInfoColumn: {
    gap: 10,
    width: '80%',
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
