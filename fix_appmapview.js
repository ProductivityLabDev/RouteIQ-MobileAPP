const fs = require('fs');

const filePath = 'src/components/AppMapView.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Change 1: Add propBusLocation to component props
content = content.replace(
  'const AppMapView: React.FC<AppMapViewProps> = ({routeStops}) => {',
  'const AppMapView: React.FC<AppMapViewProps> = ({routeStops, busLocation: propBusLocation}) => {'
);

// Change 2: Update busLocation useMemo
content = content.replace(
  `  const busLocation = useMemo(() => {
    if (routeCoordinates.length > 0) {
      const midIndex = Math.floor(routeCoordinates.length / 2);
      return routeCoordinates[midIndex];
    }
    return startLocation;
  }, [routeCoordinates, startLocation]);`,
  `  const busLocation = useMemo(() => {
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
  }, [propBusLocation, routeCoordinates, startLocation]);`
);

// Change 3: Change tracksViewChanges to false for bus marker
content = content.replace(
  `        {/* BUS MARKER */}
        <Marker
          coordinate={busLocation}
          anchor={{x: 0.5, y: 1}}
          tracksViewChanges={tracksChanges}>`,
  `        {/* BUS MARKER */}
        <Marker
          coordinate={busLocation}
          anchor={{x: 0.5, y: 1}}
          tracksViewChanges={false}>`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ File updated successfully!');
