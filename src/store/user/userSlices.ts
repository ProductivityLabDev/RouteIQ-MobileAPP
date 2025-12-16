import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {Platform} from 'react-native';
import {Buffer} from 'buffer';
import {childDropDown} from '../../utils/DummyData';

type LoginPayload = {
  email: string;
  password: string;
};

type JwtPayload = {
  sub?: number | string;
  role?: string;
  roleCode?: string;
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

export const loginParent = createAsyncThunk(
  'users/loginParent',
  async ({email, password}: LoginPayload, {rejectWithValue}) => {
    // Set this to your LAN IP when running on a physical device
    const manualHost = 'http://192.168.100.18:3000';
    const deviceHost =
      Platform.OS === 'android'
        ? 'http://10.0.2.2:3000'
        : 'http://localhost:3000';
    const baseUrl = manualHost?.trim() || deviceHost;

    try {
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password}),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message =
          errorBody?.message ||
          errorBody?.error ||
          `Login failed with status ${response.status}`;
        return rejectWithValue(message);
      }

      const data = await response.json();
      console.log('loginParent response', data);
      const token: string | undefined = data?.access_token;
      if (!token) {
        return rejectWithValue('Login response missing access_token');
      }

      const decoded = decodeJwt(token);
      const roleCodeRaw =
        decoded?.roleCode || decoded?.role || data?.roleCode || data?.role?.code;
      const roleCode =
        roleCodeRaw && typeof roleCodeRaw === 'string'
          ? roleCodeRaw.trim().toUpperCase()
          : '';
      const mappedRole =
        roleCode === 'DRIVER'
          ? 'Driver'
          : roleCode === 'RETAIL'
          ? 'Retail'
          : 'Parents';

      return {
        token,
        role: mappedRole,
        roleCode: roleCode || 'PARENT',
        userId: decoded?.sub ?? data?.id ?? null,
      };
    } catch (err) {
      console.warn('loginParent network error', {baseUrl});
      return rejectWithValue('Network error during login');
    }
  },
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    token: null,
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
    roleCode: '',
  },
  reducers: {
    saveToken: (state, {payload}) => {
      state.token = payload;
    },
    setLogout: (state, {payload}) => {
      state.logout = payload;
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
  },
  extraReducers: builder => {
    builder
      .addCase(loginParent.pending, state => {
        state.authStatus = 'loading';
        state.authError = null;
      })
      .addCase(loginParent.fulfilled, (state, {payload}) => {
        state.authStatus = 'succeeded';
        state.authError = null;
        state.token = payload.token;
        state.role = payload.role || 'Parents';
        state.roleCode = payload.roleCode || '';
        state.userId = payload.userId ?? null;
        state.logout = false;
      })
      .addCase(loginParent.rejected, (state, action) => {
        state.authStatus = 'failed';
        state.authError =
          (action.payload as string) || action.error.message || 'Login failed';
        state.token = null;
      });
  },
});

export const {
  saveToken,
  setLogout,
  setRole,
  setDriverHomeStatus,
  setRetailHomeStatus,
  setSelectedUserChatData,
  setShowStartMileAgeSheet,
  setMapViewRouteBackOn,
  setStudentAbsentModal,
  setSelectedChild,
  setForgotType,
} = userSlice.actions;

export default userSlice.reducer;
