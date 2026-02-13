import {Platform} from 'react-native';

/**
 * Backend base URL — SIRF YAHAN CHANGE KARO jab WiFi/network reconnect ho ya PC IP change ho.
 * PC ka IP check: Windows → ipconfig | Mac → ifconfig
 * Phone aur PC same WiFi pe hone chahiye.
 */
const API_BASE_URL = 'http://192.168.100.61:3000';
const API_BASE_URL_FALLBACKS = [
  'http://192.168.100.61:3000',
  'http://192.168.18.36:3000',
];
let runtimeApiBaseUrl: string = API_BASE_URL;

const getApiBaseUrl = (): string => {
  const manualHost = runtimeApiBaseUrl?.trim() || API_BASE_URL?.trim();
  const deviceHost =
    Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
  return manualHost || deviceHost;
};

const getApiBaseUrlCandidates = (): string[] => {
  const deviceHost =
    Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
  const list = [runtimeApiBaseUrl, API_BASE_URL, ...API_BASE_URL_FALLBACKS, deviceHost]
    .map(url => String(url || '').trim())
    .filter(Boolean);
  return Array.from(new Set(list));
};

const setApiBaseUrl = (url: string) => {
  runtimeApiBaseUrl = String(url || '').trim() || API_BASE_URL;
};

export {
  getApiBaseUrl,
  API_BASE_URL,
  getApiBaseUrlCandidates,
  setApiBaseUrl,
};
