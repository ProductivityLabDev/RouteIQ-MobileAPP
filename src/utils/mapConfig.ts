export const mapCustomStyle = [
    {elementType: 'geometry', stylers: [{color: '#ededeb'}]},
    {elementType: 'labels.text.fill', stylers: [{color: '#CDD2DB'}]},
    {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{color: '#e4e5e4'}],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{color: '#ededeb'}],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{color: '#ededeb'}],
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{color: '#ededeb'}],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{color: '#f6f6f6'}], 
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{color: '#f6f6f6'}],
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{color: '#f6f6f6'}],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{color: '#f6f6f6'}],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{color: '#f6f6f6'}], 
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{color: '#f6f6f6'}],
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{color: '#2f3948'}],
    },
    {
      featureType: 'transit.station',
      elementType: 'labels.text.fill',
      stylers: [{color: '#d59563'}],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{color: '#17263c'}],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{color: '#515c6d'}],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [{color: '#17263c'}],
    },
  ];

// Used by `react-native-maps-directions` (polyline + ETA). This key is already
// present in AndroidManifest; keep it restricted in Google Cloud Console.
export const googleMapsApiKey = 'AIzaSyAkiHkjo-5JKqugTE-_PwfdBb3j6Ze4jxE';
  