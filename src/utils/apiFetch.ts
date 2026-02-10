/**
 * apiFetch — thin wrapper around fetch() that handles:
 * - 401 → force logout (token expired / invalid)
 * - Adds Authorization header automatically when token is available
 *
 * Usage (inside async thunks):
 *   import { apiFetch } from '../../utils/apiFetch';
 *   const response = await apiFetch(url, { method: 'GET' }, getState);
 *
 * It reads the token from Redux state (userSlices.token).
 * On 401 it dispatches logoutUser() and shows an error toast.
 */

import {Platform} from 'react-native';
import {showErrorToast} from './toast';

// Store reference — set once at app startup to avoid circular imports
let _storeRef: any = null;

export const setApiFetchStoreRef = (store: any) => {
  _storeRef = store;
};

const getApiBaseUrl = () => {
  const manualHost = 'http://192.168.18.36:3000';
  const deviceHost =
    Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
  return manualHost?.trim() || deviceHost;
};

export {getApiBaseUrl};

/**
 * Wrapper around fetch that auto-handles 401 (force logout).
 * @param url - Full URL or path (if path, baseUrl is prepended)
 * @param options - Standard fetch RequestInit
 * @param getState - Redux getState function (from thunk)
 * @returns fetch Response
 */
export const apiFetch = async (
  url: string,
  options: RequestInit = {},
  getState?: () => any,
): Promise<Response> => {
  // Get token from thunk getState or from store reference
  let token: string | null = null;
  if (getState) {
    const state = getState();
    token = state?.userSlices?.token ?? null;
  } else if (_storeRef) {
    const state = _storeRef.getState();
    token = state?.userSlices?.token ?? null;
  }

  // Build headers
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 — force logout
  if (response.status === 401) {
    if (__DEV__) console.warn('🔒 401 Unauthorized — forcing logout');
    showErrorToast('Session Expired', 'Please login again');

    // Dispatch logoutUser — import dynamically to avoid circular deps
    if (_storeRef) {
      try {
        const {logoutUser} = require('../store/user/userSlices');
        _storeRef.dispatch(logoutUser());
      } catch (e) {
        if (__DEV__) console.warn('Could not dispatch logoutUser:', e);
      }
    }
  }

  return response;
};
