const fs = require('fs');

const filePath = 'src/components/AppMapView.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Change 2: Update busLocation useMemo - using more flexible matching
const busLocationPattern = /const busLocation = useMemo\(\(\) => \{[\s\S]*?if \(routeCoordinates\.length > 0\) \{[\s\S]*?return routeCoordinates\[midIndex\];[\s\S]*?\}[\s\S]*?return startLocation;[\s\S]*?\}, \[routeCoordinates, startLocation\]\);/;

const newBusLocation = `const busLocation = useMemo(() => {
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
  }, [propBusLocation, routeCoordinates, startLocation]);`;

if (busLocationPattern.test(content)) {
  content = content.replace(busLocationPattern, newBusLocation);
  console.log('✅ busLocation useMemo updated');
} else {
  console.log('❌ busLocation pattern not found');
}

// Change 3: Change tracksViewChanges to false for bus marker
const markerPattern = /(\{\/\* BUS MARKER \*\/\s*<Marker\s+coordinate=\{busLocation\}\s+anchor=\{\{x: 0\.5, y: 1\}\}\s+)tracksViewChanges=\{tracksChanges\}(>)/;

if (markerPattern.test(content)) {
  content = content.replace(markerPattern, '$1tracksViewChanges={false}$2');
  console.log('✅ tracksViewChanges updated to false');
} else {
  // Try alternative pattern
  const altPattern = /tracksViewChanges=\{tracksChanges\}>\s+<View style=\{styles\.busPin\}>/;
  if (altPattern.test(content)) {
    content = content.replace(altPattern, 'tracksViewChanges={false}>\n          <View style={styles.busPin}>');
    console.log('✅ tracksViewChanges updated (alternative pattern)');
  } else {
    console.log('❌ tracksViewChanges pattern not found');
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ File update completed!');
