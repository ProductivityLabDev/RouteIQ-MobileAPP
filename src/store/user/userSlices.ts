import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {Platform} from 'react-native';
import {Buffer} from 'buffer';
import {childDropDown} from '../../utils/DummyData';
import {showErrorToast, showSuccessToast} from '../../utils/toast';
import {
  getApiBaseUrl,
  getApiBaseUrlCandidates,
  setApiBaseUrl,
} from '../../utils/apiConfig';

const LOGIN_TIMEOUT_MS = 8000;

/** Promise.race se timeout – RN me AbortController reliable nahi, isliye 15s baad reject. */
function fetchWithTimeout(
  url: string,
  options: RequestInit,
  ms: number = LOGIN_TIMEOUT_MS,
): Promise<Response> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('LOGIN_TIMEOUT')), ms);
  });
  return Promise.race([fetch(url, options), timeoutPromise]);
}

type LoginPayload = {
  email: string;
  password: string;
};

type ResetPasswordPayload = {
  email: string;
};

type VerifyOtpPayload = {
  email: string;
  otp: string;
};

type ConfirmResetPasswordPayload = {
  userId: number;
  newPassword: string;
};

type ParentRouteMapPayload = {
  studentId: number | string;
  type?: 'AM' | 'PM' | 'ALL';
};

type JwtPayload = {
  sub?: number | string;
  role?: string;
  roleCode?: string;
  employeeId?: number | string;
  vehicleId?: number | string;
  routeId?: number | string;
  tripId?: number | string;
};

const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      return null;
    }
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const jsonPayload =
      (globalThis as any)?.atob?.(padded) ||
      (typeof Buffer !== 'undefined'
        ? Buffer.from(padded, 'base64').toString('utf8')
        : undefined);
    if (!jsonPayload) {
      return null;
    }
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const fetchParentStudents = createAsyncThunk(
  'users/fetchParentStudents',
  async (_: void, {getState, rejectWithValue}) => {
    const baseUrl = getApiBaseUrl();
    const state: any = getState();
    const token: string | null | undefined = state?.userSlices?.token;

    if (!token) {
      return rejectWithValue('Missing auth token');
    }

    try {
      const state2: any = getState();
      const parentId = state2?.userSlices?.userId ?? state2?.userSlices?.employeeId;
      const query = parentId != null ? `?parentId=${parentId}` : '';
      const url = `${baseUrl}/parent/studentsByParentsId${query}`;
      if (__DEV__) console.log('fetchParentStudents calling:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        if (__DEV__) console.warn('fetchParentStudents failed', response.status, errorText);
        return rejectWithValue(
          errorText || `Fetch students failed with status ${response.status}`,
        );
      }

      const data = await response.json().catch(() => null);
      let list: any[] = [];
      if (data?.ok === true && Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data?.students)) {
        list = data.students;
      } else if (data?.data && Array.isArray(data.data.students)) {
        list = data.data.students;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data)) {
        list = data;
      } else if (data?.data && Array.isArray(data.data)) {
        list = data.data;
      }
      if (__DEV__) {
        console.log('fetchParentStudents response:', list?.length ?? 0, 'items', list?.[0] ?? null);
        if (list?.length === 0 && data != null) console.log('fetchParentStudents raw data keys:', Object.keys(data || {}));
      }
      return list;
    } catch (err) {
      console.warn('fetchParentStudents exception', {baseUrl, err});
      return rejectWithValue('Network error while fetching parent students');
    }
  },
  {
    condition: (_, {getState}) => {
      const state: any = getState();
      const status: string | undefined = state?.userSlices?.parentStudentsStatus;
      if (status === 'loading') {
        return false;
      }
      return true;
    },
  },
);

export const fetchParentRouteMap = createAsyncThunk(
  'users/fetchParentRouteMap',
  async (
    {studentId, type = 'AM'}: ParentRouteMapPayload,
    {getState, rejectWithValue},
  ) => {
    const baseUrl = getApiBaseUrl();
    const state: any = getState();
    const token: string | null | undefined = state?.userSlices?.token;

    if (!token) {
      return rejectWithValue('Missing auth token');
    }

    try {
      const query = new URLSearchParams({
        studentId: String(studentId),
        type: String(type).toUpperCase(),
      });
      const response = await fetch(`${baseUrl}/parent/route-map?${query}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        return rejectWithValue(
          errorText || `Fetch route map failed with status ${response.status}`,
        );
      }

      const data = await response.json().catch(() => null);
      return data;
    } catch (err) {
      console.warn('fetchParentRouteMap exception', {baseUrl, err});
      return rejectWithValue('Network error while fetching route map');
    }
  },
  {
    condition: (
      {studentId, type = 'AM'}: ParentRouteMapPayload,
      {getState},
    ) => {
      const state: any = getState();
      const status: string | undefined = state?.userSlices?.parentRouteMapStatus;
      if (status === 'loading') {
        return false;
      }

      const currentStudentId = state?.userSlices?.parentRouteMapStudentId;
      const currentType = state?.userSlices?.parentRouteMapType;
      if (
        status === 'succeeded' &&
        currentStudentId != null &&
        String(currentStudentId) === String(studentId) &&
        String(currentType || '').toUpperCase() === String(type).toUpperCase()
      ) {
        return false;
      }
      return true;
    },
  },
);

type FetchParentContactsPayload = {
  studentId: number | string;
};

export const fetchParentContacts = createAsyncThunk(
  'users/fetchParentContacts',
  async (
    {studentId}: FetchParentContactsPayload,
    {getState, rejectWithValue},
  ) => {
    const baseUrl = getApiBaseUrl();
    const state: any = getState();
    const token: string | null | undefined = state?.userSlices?.token;

    if (!token) {
      return rejectWithValue('Missing auth token');
    }

    try {
      const query = new URLSearchParams({
        studentId: String(studentId),
      });
      const response = await fetch(`${baseUrl}/parent/contacts?${query}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        return rejectWithValue(
          errorText || `Fetch contacts failed with status ${response.status}`,
        );
      }

      const data = await response.json().catch(() => null);
      // Handle response format: { ok: true, data: [...] }
      if (data?.ok === true && Array.isArray(data?.data)) {
        return data.data;
      }
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    } catch (err) {
      console.warn('fetchParentContacts exception', {baseUrl, err});
      return rejectWithValue('Network error while fetching contacts');
    }
  },
);

export const loginUser = createAsyncThunk(
  'users/loginUser',
  async ({email, password}: LoginPayload, {rejectWithValue}) => {
    const baseCandidates = getApiBaseUrlCandidates();
    let lastNetworkError: any = null;

    for (const baseUrl of baseCandidates) {
      const url = `${baseUrl}/auth/login`;
      try {
        console.log('[Login] Trying URL:', url);
        const response = await fetchWithTimeout(
          url,
          {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username: email, password}), // backend: username ya email
          },
          LOGIN_TIMEOUT_MS,
        );

        // Reachable backend mil gaya; isko runtime default bana do.
        setApiBaseUrl(baseUrl);

        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          let errorBody: any = null;
          try {
            errorBody = errorText ? JSON.parse(errorText) : null;
          } catch (e) {
            errorBody = null;
          }
          const message =
            errorBody?.message ||
            errorBody?.error ||
            errorText ||
            `Login failed with status ${response.status}`;
          return rejectWithValue(message);
        }

        try {
          const data = await response.json();
          const token: string | undefined =
            data?.access_token ?? data?.accessToken ?? data?.token;
          if (!token) {
            if (__DEV__) console.warn('[loginUser] 200 but no token. Keys:', Object.keys(data || {}));
            return rejectWithValue('Login response missing access_token');
          }

          const decoded = decodeJwt(token);
          const decodedAny = (decoded ?? {}) as any;
          const roleCodeRaw =
            decoded?.roleCode ||
            decoded?.role ||
            data?.roleCode ||
            data?.role?.code;
          const roleCode =
            roleCodeRaw && typeof roleCodeRaw === 'string'
              ? roleCodeRaw.trim().toUpperCase()
              : '';
          const mappedRole =
            roleCode === 'DRIVER'
              ? 'Driver'
              : roleCode === 'RETAIL'
              ? 'Retail'
              : roleCode === 'PARENT' || roleCode === 'PARENTS'
              ? 'Parents'
              : 'Parents';

          const employeeId =
            mappedRole === 'Driver'
              ? (decoded?.employeeId ?? decoded?.sub ?? null)
              : null;

          const vehicleId =
            mappedRole === 'Driver'
              ? (decodedAny?.vehicleId ??
                decodedAny?.VehicleId ??
                decodedAny?.vehicle_id ??
                decodedAny?.VehicleID ??
                null)
              : null;

          const routeId =
            mappedRole === 'Driver'
              ? (decodedAny?.routeId ??
                decodedAny?.RouteId ??
                decodedAny?.route_id ??
                decodedAny?.RouteID ??
                null)
              : null;

          const tripId =
            mappedRole === 'Driver'
              ? (decodedAny?.tripId ??
                decodedAny?.TripId ??
                decodedAny?.trip_id ??
                decodedAny?.TripID ??
                null)
              : null;

          showSuccessToast('Logged in', 'Welcome back');
          if (mappedRole === 'Retail') {
            console.log('[Login Retail] Token:', token);
            console.log('[Login Retail] Token length:', token?.length);
          }
          return {
            token,
            role: mappedRole,
            roleCode: roleCode || 'PARENT',
            userId: decoded?.sub ?? data?.id ?? null,
            employeeId,
            vehicleId,
            routeId,
            tripId,
          };
        } catch (e) {
          return rejectWithValue(`Login response is not valid JSON`);
        }
      } catch (err: any) {
        lastNetworkError = err;
        const msg = err?.message || String(err);
        console.warn('[Login] Request failed for', url, msg);
        // Timeout/network: next URL try karo
        continue;
      }
    }

    const baseUrl = getApiBaseUrl();
    console.warn('[Login] All URLs failed.', {baseUrl, lastError: lastNetworkError});
    const isTimeout =
      lastNetworkError?.message === 'LOGIN_TIMEOUT' ||
      lastNetworkError?.message?.includes?.('abort');
    return rejectWithValue(
      isTimeout
        ? 'Request timed out. Check WiFi and apiConfig.ts'
        : 'Cannot reach server. Check WiFi and apiConfig.ts base URL.',
    );
  },
);

export const loginRetailUser = createAsyncThunk(
  'users/loginRetailUser',
  async ({email, password}: LoginPayload, {rejectWithValue}) => {
    const baseCandidates = getApiBaseUrlCandidates();
    const urlPath = '/retailer/auth/login';
    const body = JSON.stringify({email, password});

    console.log('[Login Retail] Starting. Will try', baseCandidates.length, 'URLs');

    for (const baseUrl of baseCandidates) {
      const url = `${baseUrl}${urlPath}`;
      try {
        console.log('[Login Retail] Trying URL:', url);
        const response = await fetchWithTimeout(
          url,
          {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body,
          },
          LOGIN_TIMEOUT_MS,
        );
        const rawText = await response.text().catch(() => '');
        console.log('[Login Retail] Response status:', response.status, '| raw length:', rawText?.length);
        let json: any = null;
        try {
          json = rawText ? JSON.parse(rawText) : null;
        } catch (_e) {
          if (__DEV__) {
            console.warn('[loginRetail] response not JSON', response.status, rawText?.slice(0, 200));
          }
          if (!response.ok) {
            return rejectWithValue(rawText || `Login failed ${response.status}`);
          }
          return rejectWithValue('Invalid response from server');
        }

        if (!response.ok) {
          const message =
            json?.message || json?.error || rawText || `Login failed ${response.status}`;
          console.warn('[Login Retail] Failed', response.status, '| message:', message, '| json:', JSON.stringify(json)?.slice(0, 300));
          return rejectWithValue(message);
        }

        // Success (2xx): token kahin bhi ho sakta hai
        console.log('[Login Retail] Success JSON keys:', json ? Object.keys(json) : []);
        if (json?.data) console.log('[Login Retail] json.data keys:', Object.keys(json.data));
        const token: string | undefined =
          json?.data?.access_token ??
          json?.data?.accessToken ??
          json?.access_token ??
          json?.accessToken ??
          json?.data?.token;
        console.log('[Login Retail] Token found:', !!token, '| token length:', token?.length ?? 0);
        if (token) console.log('[Login Retail] Token (first 50 chars):', token?.slice(0, 50) + '...');
        if (!token) {
          console.warn('[Login Retail] 200 but no token. Full json:', JSON.stringify(json)?.slice(0, 500));
          return rejectWithValue('Login response missing token');
        }
        setApiBaseUrl(baseUrl);
        showSuccessToast('Logged in', 'Welcome back');
        return {token, role: 'Retail' as const};
      } catch (err: any) {
        const msg = err?.message || String(err);
        console.warn('[Login Retail] Failed for', url, msg);
        // Timeout/network: next URL try karo, return mat karo
        continue;
      }
    }

    showErrorToast('Login failed', 'Cannot reach server');
    return rejectWithValue('Cannot reach server. Check apiConfig.ts and backend.');
  },
);

export const requestResetPassword = createAsyncThunk(
  'users/requestResetPassword',
  async ({email}: ResetPasswordPayload, {rejectWithValue}) => {
    const baseUrl = getApiBaseUrl();
    try {
      const response = await fetch(`${baseUrl}/auth/request-password-reset`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email}),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        showErrorToast('Request failed', errorText || undefined);
        return rejectWithValue(
          errorText || `Reset password failed with status ${response.status}`,
        );
      }

      // backend might return empty body or JSON; we don't need it for the flow
      await response.text().catch(() => '');
      showSuccessToast('OTP sent', 'Check your email');
      return {ok: true, email};
    } catch (err) {
      console.warn('requestResetPassword exception', {baseUrl, err});
      showErrorToast('Request failed', 'Network error');
      return rejectWithValue('Network/exception error during reset-password');
    }
  },
);

export const verifyOtp = createAsyncThunk(
  'users/verifyOtp',
  async ({email, otp}: VerifyOtpPayload, {rejectWithValue}) => {
    const baseUrl = getApiBaseUrl();
    try {
      const response = await fetch(`${baseUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, otp}),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        showErrorToast('Invalid code', errorText || undefined);
        return rejectWithValue(
          errorText || `OTP verify failed with status ${response.status}`,
        );
      }

      try {
        const data = await response.json();
        showSuccessToast('Verified', 'OTP verified successfully');
        return {ok: true, data};
      } catch (e) {
        const text = await response.text().catch(() => '');
        showSuccessToast('Verified', 'OTP verified successfully');
        return {ok: true, data: {raw: text}};
      }
    } catch (err) {
      console.warn('verifyOtp exception', {baseUrl, err});
      showErrorToast('Verification failed', 'Network error');
      return rejectWithValue('Network/exception error during verify-otp');
    }
  },
);

export const confirmResetPassword = createAsyncThunk(
  'users/confirmResetPassword',
  async (
    {userId, newPassword}: ConfirmResetPasswordPayload,
    {rejectWithValue},
  ) => {
    const baseUrl = getApiBaseUrl();
    try {
      const response = await fetch(`${baseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({userId, newPassword}),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        let errorBody: any = null;
        try {
          errorBody = errorText ? JSON.parse(errorText) : null;
        } catch (e) {
          errorBody = null;
        }
        showErrorToast(
          'Reset failed',
          (errorBody?.message && Array.isArray(errorBody.message)
            ? errorBody.message.join(', ')
            : errorBody?.message) ||
            errorBody?.error ||
            errorText ||
            undefined,
        );
        return rejectWithValue(
          errorBody?.message ||
            errorBody?.error ||
            errorText ||
            `Reset password failed with status ${response.status}`,
        );
      }

      try {
        const data = await response.json();
        showSuccessToast('Password updated', 'You can login now');
        return {ok: true, data};
      } catch (e) {
        const text = await response.text().catch(() => '');
        showSuccessToast('Password updated', 'You can login now');
        return {ok: true, data: {raw: text}};
      }
    } catch (err) {
      console.warn('confirmResetPassword exception', {baseUrl, err});
      showErrorToast('Reset failed', 'Network error');
      return rejectWithValue('Network/exception error during reset-password');
    }
  },
);

const initialState = {
  token: null as string | null,
  logout: false,
  role: '',
  driverHomeStatus: false,
  retailHomeStatus: false,
  selectedUserChatData: {},
  showStartMileAgeSheet: false,
  mapViewRouteBackOn: 'DriverHomeScreen',
  studentAbsentModal: false,
  selectedChild: {},
  forgotType: '',
  authStatus: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
  authError: null as string | null,
  userId: null as number | string | null,
  employeeId: null as number | string | null,
  vehicleId: null as number | string | null,
  routeId: null as number | string | null,
  tripId: null as number | string | null,
  roleCode: '',
  resetStatus: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
  resetError: null as string | null,
  resetEmail: '',
  resetUserId: null as number | null,
  otpStatus: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
  otpError: null as string | null,
  otpResult: null as any,
  confirmResetStatus: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
  confirmResetError: null as string | null,
  parentStudents: [] as any[],
  parentStudentsStatus: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
  parentStudentsError: null as string | null,
  parentRouteMap: null as any,
  parentRouteMapStatus: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
  parentRouteMapError: null as string | null,
  parentRouteMapStudentId: null as number | string | null,
  parentRouteMapType: 'AM' as 'AM' | 'PM' | 'ALL',
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    saveToken: (state, {payload}) => {
      state.token = payload;
    },
    setLogout: (state, {payload}) => {
      state.logout = payload;
    },
    resetAuthLoading: state => {
      state.authStatus = 'idle';
      state.authError = null;
    },
    setRole: (state, {payload}) => {
      state.role = payload;
    },
    setDriverHomeStatus: (state, {payload}) => {
      state.driverHomeStatus = payload;
    },

    setRetailHomeStatus: (state, {payload}) => {
      state.retailHomeStatus = payload;
    },

    setSelectedUserChatData: (state, {payload}) => {
      state.selectedUserChatData = payload;
    },
    setShowStartMileAgeSheet: (state, {payload}) => {
      state.showStartMileAgeSheet = payload;
    },
    setMapViewRouteBackOn: (state, {payload}) => {
      state.mapViewRouteBackOn = payload;
    },
    setStudentAbsentModal: (state, {payload}) => {
      state.studentAbsentModal = payload;
    },
    setSelectedChild: (state, {payload}) => {
      state.selectedChild = payload;
    },
    setForgotType: (state, {payload}) => {
      state.forgotType = payload;
    },
    logoutUser: state => {
      // Keep "logout" true to skip onboarding screen after logout.
      // Keep the current role so logout from Driver returns to Driver login (same for Parent/Retail).
      const prevRole = state.role;
      const prevRoleCode = state.roleCode;
      Object.assign(state, initialState);
      state.logout = true;
      state.role = prevRole;
      state.roleCode = prevRoleCode;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginUser.pending, state => {
        state.authStatus = 'loading';
        state.authError = null;
      })
      .addCase(loginUser.fulfilled, (state, {payload}) => {
        state.authStatus = 'succeeded';
        state.authError = null;
        state.token = payload.token;
        state.role = payload.role || 'Parents';
        state.roleCode = payload.roleCode || '';
        state.userId = payload.userId ?? null;
        state.employeeId = payload.employeeId ?? null;
        state.vehicleId = payload.vehicleId ?? null;
        state.routeId = payload.routeId ?? null;
        state.tripId = payload.tripId ?? null;
        state.logout = false;
        if (__DEV__) {
          console.log('AUTH_TOKEN', payload.token);
          console.log('AUTH_EMPLOYEE_ID', payload.employeeId);
          console.log('AUTH_VEHICLE_ID', payload.vehicleId);
          console.log('AUTH_ROUTE_ID', payload.routeId);
          console.log('AUTH_TRIP_ID', payload.tripId);
          console.log('AUTH_ROLE', payload.role, payload.roleCode);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.authStatus = 'failed';
        state.authError =
          (action.payload as string) || action.error.message || 'Login failed';
        state.token = null;
      })
      // Retail login
      .addCase(loginRetailUser.pending, state => {
        state.authStatus = 'loading';
        state.authError = null;
      })
      .addCase(loginRetailUser.fulfilled, (state, {payload}) => {
        state.authStatus = 'succeeded';
        state.authError = null;
        state.token = payload.token;
        state.role = 'Retail';
        state.logout = false;
      })
      .addCase(loginRetailUser.rejected, (state, action) => {
        state.authStatus = 'failed';
        state.authError = (action.payload as string) || action.error.message || 'Login failed';
        state.token = null;
      })
      .addCase(requestResetPassword.pending, state => {
        state.resetStatus = 'loading';
        state.resetError = null;
      })
      .addCase(requestResetPassword.fulfilled, (state, {payload}) => {
        state.resetStatus = 'succeeded';
        state.resetError = null;
        state.resetEmail = payload?.email || '';
      })
      .addCase(requestResetPassword.rejected, (state, action) => {
        state.resetStatus = 'failed';
        state.resetError =
          (action.payload as string) ||
          action.error.message ||
          'Reset password failed';
      })
      .addCase(verifyOtp.pending, state => {
        state.otpStatus = 'loading';
        state.otpError = null;
      })
      .addCase(verifyOtp.fulfilled, (state, {payload}) => {
        state.otpStatus = 'succeeded';
        state.otpError = null;
        state.otpResult = payload?.data ?? null;
        const possibleUserId =
          payload?.data?.userId ?? payload?.data?.id ?? payload?.data?.sub ?? null;
        state.resetUserId =
          typeof possibleUserId === 'number'
            ? possibleUserId
            : typeof possibleUserId === 'string' && possibleUserId.trim()
            ? Number(possibleUserId)
            : null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.otpStatus = 'failed';
        state.otpError =
          (action.payload as string) ||
          action.error.message ||
          'OTP verification failed';
      })
      .addCase(confirmResetPassword.pending, state => {
        state.confirmResetStatus = 'loading';
        state.confirmResetError = null;
      })
      .addCase(confirmResetPassword.fulfilled, state => {
        state.confirmResetStatus = 'succeeded';
        state.confirmResetError = null;
      })
      .addCase(confirmResetPassword.rejected, (state, action) => {
        state.confirmResetStatus = 'failed';
        state.confirmResetError =
          (action.payload as string) ||
          action.error.message ||
          'Reset password failed';
      })
      .addCase(fetchParentStudents.pending, state => {
        state.parentStudentsStatus = 'loading';
        state.parentStudentsError = null;
      })
      .addCase(fetchParentStudents.fulfilled, (state, {payload}) => {
        state.parentStudentsStatus = 'succeeded';
        state.parentStudentsError = null;
        state.parentStudents = Array.isArray(payload) ? payload : [];
      })
      .addCase(fetchParentStudents.rejected, (state, action) => {
        state.parentStudentsStatus = 'failed';
        state.parentStudentsError =
          (action.payload as string) ||
          action.error.message ||
          'Failed to fetch students';
      })
      .addCase(fetchParentRouteMap.pending, state => {
        state.parentRouteMapStatus = 'loading';
        state.parentRouteMapError = null;
      })
      .addCase(fetchParentRouteMap.fulfilled, (state, {payload}) => {
        state.parentRouteMapStatus = 'succeeded';
        state.parentRouteMapError = null;
        state.parentRouteMap = payload;
        state.parentRouteMapStudentId =
          payload?.student?.studentId ??
          payload?.student?.StudentId ??
          payload?.studentId ??
          null;
        state.parentRouteMapType =
          (payload?.type && String(payload.type).toUpperCase()) || 'AM';
      })
      .addCase(fetchParentRouteMap.rejected, (state, action) => {
        state.parentRouteMapStatus = 'failed';
        state.parentRouteMapError =
          (action.payload as string) ||
          action.error.message ||
          'Failed to fetch route map';
      });
  },
});

export const {
  saveToken,
  setLogout,
  resetAuthLoading,
  setRole,
  setDriverHomeStatus,
  setRetailHomeStatus,
  setSelectedUserChatData,
  setShowStartMileAgeSheet,
  setMapViewRouteBackOn,
  setStudentAbsentModal,
  setSelectedChild,
  setForgotType,
  logoutUser,
} = userSlice.actions;

export default userSlice.reducer;
