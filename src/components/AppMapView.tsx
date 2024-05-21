import React from 'react';
import {StyleSheet, View} from 'react-native';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import {mapCustomStyle} from '../utils/mapConfig';

const AppMapView = () => {
  const startLocation = {
    latitude: 37.7749,
    longitude: -122.4454,
  };

  const endLocation = {
    latitude: 37.7793,
    longitude: -122.426,
  };
  return (
    <View style={styles.mapContainer}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={{
          latitude: (startLocation.latitude + endLocation.latitude) / 2,
          longitude: (startLocation.longitude + endLocation.longitude) / 2,
          latitudeDelta:
            Math.abs(startLocation.latitude - endLocation.latitude) * 1.5,
          longitudeDelta:
            Math.abs(startLocation.longitude - endLocation.longitude) * 1.5,
        }}
        customMapStyle={mapCustomStyle}></MapView>
    </View>
  );
};

export default AppMapView;

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
