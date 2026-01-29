import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import AppStyles from '../styles/AppStyles';
import AppFonts from '../utils/appFonts';
import {AppColors} from '../utils/color';
import {hp} from '../utils/constants';
import {googleMapsApiKey, mapCustomStyle} from '../utils/mapConfig';
import {fontSize, size} from '../utils/responsiveFonts';
import GlobalIcon from './GlobalIcon';
import Range from './Range';

type RouteStop = {
  latitude?: number | null;
  longitude?: number | null;
  stopOrder?: number | null;
};

type AppMapViewProps = {
  routeStops?: RouteStop[] | null;
  onRouteInfoChange?: (routeInfo: {distance: number | null; duration: number | null}) => void;
};

const AppMapView: React.FC<AppMapViewProps> = ({routeStops, busLocation: propBusLocation}) => {
  const navigation = useNavigation();
  const [showDistance, setShowDistance] = useState(false);
  const mapRef = useRef<MapView | null>(null);
  const [routeInfo, setRouteInfo] = useState<{
    distance: number | null;
    duration: number | null;
  }>({distance: null, duration: null});

  // 🚀 Most Important Fix — prevents flicker   
  const [tracksChanges, setTracksChanges] = useState(true);

  const fallbackStart = {latitude: 37.7749, longitude: -122.4454};
  const fallbackEnd = {latitude: 37.7793, longitude: -122.426};

  const handleChange = useCallback((condition: boolean) => {
    setShowDistance(condition);
  }, []);

  const orderedStops = useMemo(() => {
    if (!Array.isArray(routeStops)) return [];
    return routeStops
      .filter(
        stop =>
          Number.isFinite(Number(stop.latitude)) &&
          Number.isFinite(Number(stop.longitude)),
      )
      .sort(
        (a, b) =>
          Number(a.stopOrder ?? 0) - Number(b.stopOrder ?? 0),
      );
  }, [routeStops]);

  const startLocation = orderedStops[0]
    ? {
        latitude: Number(orderedStops[0].latitude),
        longitude: Number(orderedStops[0].longitude),
      }
    : fallbackStart;

  const endLocation =
    orderedStops.length > 1
      ? {
          latitude: Number(
            orderedStops[orderedStops.length - 1].latitude,
          ),
          longitude: Number(
            orderedStops[orderedStops.length - 1].longitude,
          ),
        }
      : fallbackEnd;

  const waypoints = useMemo(() => {
    if (orderedStops.length <= 2) return [];
    return orderedStops.slice(1, -1).map(stop => ({
      latitude: Number(stop.latitude),
      longitude: Number(stop.longitude),
    }));
  }, [orderedStops]);

  const routeCoordinates = useMemo(() => {
    return orderedStops.map(stop => ({
      latitude: Number(stop.latitude),
      longitude: Number(stop.longitude),
    }));
  }, [orderedStops]);

  const shouldRenderDirections = orderedStops.length >= 2;

  const busLocation = useMemo(() => {
    // Use prop bus location if provided (from tracking API)
    if (propBusLocation?.latitude && propBusLocation?.longitude) {
      return {
        latitude: Number(propBusLocation.latitude),
        longitude: Number(propBusLocation.longitude),
      };
    }
    // Fallback to mid point of route
    if (routeCoordinates.length > 0) {
      const midIndex = Math.floor(routeCoordinates.length / 2);
      return routeCoordinates[midIndex];
    }
    return startLocation;
  }, [propBusLocation, routeCoordinates, startLocation]);

  const etaLabel = useMemo(() => {
    return routeInfo.duration == null
      ? '—'
      : `${Math.round(routeInfo.duration)} min`;
  }, [routeInfo.duration]);

  const distanceLabel = useMemo(
    () =>
      routeInfo.distance == null
        ? ''
        : `${routeInfo.distance.toFixed(1)} km`,
    [routeInfo.distance],
  );

  return (
    <View style={styles.mapContainer}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={AppStyles.map}
        ref={mapRef}
        region={{
          latitude:
            (startLocation.latitude + endLocation.latitude) / 2,
          longitude:
            (startLocation.longitude + endLocation.longitude) / 2,
          latitudeDelta:
            Math.abs(
              startLocation.latitude - endLocation.latitude,
            ) * 1.5,
          longitudeDelta:
            Math.abs(
              startLocation.longitude -
                endLocation.longitude,
            ) * 1.5,
        }}
        customMapStyle={mapCustomStyle}>
        {/* ROUTE */}
        {shouldRenderDirections && (
          <MapViewDirections
            origin={startLocation}
            destination={endLocation}
            waypoints={waypoints}
            apikey={googleMapsApiKey}
            strokeWidth={4}
            strokeColor={AppColors.black}
            optimizeWaypoints={false}
            onReady={result => {
              setRouteInfo({
                distance: result.distance,
                duration: result.duration,
              });

              // Stop flicker after render
              setTracksChanges(false);

              mapRef.current?.fitToCoordinates(
                result.coordinates,
                {
                  edgePadding: {
                    top: hp(6),
                    right: hp(6),
                    bottom: hp(6),
                    left: hp(6),
                  },
                  animated: true,
                },
              );
            }}
            onError={error =>
              __DEV__ &&
              console.warn('MapViewDirections error', error)
            }
          />
        )}

        {/* START MARKER */}
        <Marker
          coordinate={startLocation}
          anchor={{x: 0.5, y: 0.5}}
          tracksViewChanges={tracksChanges}>
          <View style={styles.iconMarker}>
            <GlobalIcon
              library="MaterialIcons"
              name="home"
              color={AppColors.white}
              size={hp(2.6)}
            />
          </View>
        </Marker>

        {/* END MARKER */}
        <Marker
          coordinate={endLocation}
          anchor={{x: 0.5, y: 0.5}}
          tracksViewChanges={tracksChanges}>
          <View style={styles.iconMarker}>
            <GlobalIcon
              library="MaterialIcons"
              name="school"
              color={AppColors.white}
              size={hp(2.6)}
            />
          </View>
        </Marker>

        {/* BUS MARKER */}
        <Marker
          coordinate={busLocation}
          anchor={{x: 0.5, y: 1}}
          tracksViewChanges={false}>
          <View style={styles.busPin}>
            <GlobalIcon
              library="MaterialIcons"
              name="location-on"
              color={AppColors.red}
              size={hp(5)}
            />
            <View style={styles.busPinIcon}>
              <GlobalIcon
                library="MaterialCommunityIcons"
                name="bus"
                color={AppColors.white}
                size={hp(2)}
              />
            </View>
          </View>
        </Marker>
      </MapView>

      <Pressable
        onPress={() => handleChange(true)}
        style={[
          styles.bottomContainers,
          {bottom: hp(49), justifyContent: 'center'},
        ]}></Pressable>

      {showDistance && (
        <Range onPress={() => handleChange(false)} />
      )}

      <View style={styles.bottomContainers}>
        <View style={styles.firstContainer}>
          <Text
            style={[
              AppStyles.subHeading,
              {
                fontSize: size.default,
                fontFamily: AppFonts.NunitoSansBold,
              },
            ]}>
            Boarding status:
          </Text>
          <Text style={styles.onRouteTitle}>On Route</Text>
          <Text
            style={[
              AppStyles.subHeading,
              {
                fontSize: fontSize(14),
                fontFamily: AppFonts.NunitoSansBold,
              },
            ]}>
            ETA:{' '}
            <Text style={styles.timeTitle}>
              {etaLabel}
              {distanceLabel ? ` • ${distanceLabel}` : ''}
            </Text>
          </Text>
        </View>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate('ParentFeedback')
          }
          style={styles.secondContainer}>
          <View style={{marginBottom: hp(-1)}}>
            <GlobalIcon
              library="FontelloIcon"
              name="group-1982"
              color={AppColors.red}
              size={hp(4)}
            />
            <View>
              <Text
                style={[
                  AppStyles.subHeading,
                  {
                    fontSize: size.default,
                    fontFamily:
                      AppFonts.NunitoSansBold,
                    marginTop: hp(0.5),
                  },
                ]}>
                Report an Issue
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AppMapView;

const styles = StyleSheet.create({
  mapContainer: {flex: 1, width: '100%', overflow: 'hidden'},
  bottomContainers: {
    position: 'absolute',
    bottom: hp(28),
    paddingHorizontal: hp(2),
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'flex-end',
  },
  firstContainer: {
    backgroundColor: AppColors.white,
    width: hp(22),
    paddingHorizontal: hp(2),
    paddingVertical: hp(1),
    borderRadius: hp(1),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  onRouteTitle: {
    fontSize: size.slg,
    color: AppColors.red,
    fontFamily: AppFonts.NunitoSansSemiBold,
  },
  timeTitle: {
    fontSize: fontSize(14),
    color: AppColors.red,
    fontFamily: AppFonts.NunitoSansBold,
  },
  secondContainer: {
    backgroundColor: AppColors.white,
    padding: hp(2),
    borderRadius: hp(2),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  iconMarker: {
    height: hp(5),
    width: hp(5),
    borderRadius: hp(2.5),
    backgroundColor: AppColors.black,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: AppColors.white,
  },
  busPin: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  busPinIcon: {
    position: 'absolute',
    top: hp(1),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
  