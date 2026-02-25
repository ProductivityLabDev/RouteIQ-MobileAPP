import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'API_BASE_URL';

/**
 * Backend base URL — Login screen se bhi set kar sakte ho (Server URL input).
 * PC ka IP: Windows → ipconfig | Mac → ifconfig
 * Phone aur PC same WiFi pe hone chahiye.
 */
const API_BASE_URL = 'http://192.168.18.36:3000';
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

const saveApiBaseUrl = async (url: string): Promise<void> => {
  const u = String(url || '').trim() || API_BASE_URL;
  runtimeApiBaseUrl = u;
  await AsyncStorage.setItem(STORAGE_KEY, u);
};

const loadSavedApiBaseUrl = async (): Promise<string> => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved && String(saved).trim()) {
      runtimeApiBaseUrl = String(saved).trim();
      return runtimeApiBaseUrl;
    }
  } catch (_e) {}
  return getApiBaseUrl();
};

export {
  getApiBaseUrl,
  API_BASE_URL,
  getApiBaseUrlCandidates,
  setApiBaseUrl,
  saveApiBaseUrl,
  loadSavedApiBaseUrl,
};
