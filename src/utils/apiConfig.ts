import {Platform} from 'react-native';

/**
 * Backend base URL — SIRF YAHAN CHANGE KARO jab WiFi/network reconnect ho ya PC IP change ho.
 * PC ka IP check: Windows → ipconfig | Mac → ifconfig
 * Phone aur PC same WiFi pe hone chahiye.
 */
const API_BASE_URL = 'http://192.168.18.36:3000';

const getApiBaseUrl = (): string => {
  const manualHost = API_BASE_URL?.trim();
  const deviceHost =
    Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
  return manualHost || deviceHost;
};

export {getApiBaseUrl, API_BASE_URL};
