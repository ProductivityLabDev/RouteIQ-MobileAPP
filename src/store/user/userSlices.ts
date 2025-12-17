import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {Platform} from 'react-native';
import {Buffer} from 'buffer';
import {childDropDown} from '../../utils/DummyData';

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

const getApiBaseUrl = () => {
  // For physical device dev, point to your machine LAN IP
  const manualHost = 'http://192.168.100.53:3000';
  const deviceHost =
    Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
  return manualHost?.trim() || deviceHost;
};

export const loginUser = createAsyncThunk(
  'users/loginUser',
  async ({email, password}: LoginPayload, {rejectWithValue}) => {
    const baseUrl = getApiBaseUrl();

    try {
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password}),
      });

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
        const token: string | undefined = data?.access_token;
        if (!token) {
          return rejectWithValue('Login response missing access_token');
        }

        const decoded = decodeJwt(token);
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

        return {
          token,
          role: mappedRole,
          roleCode: roleCode || 'PARENT',
          userId: decoded?.sub ?? data?.id ?? null,
        };
      } catch (e) {
        return rejectWithValue(
          `Login response is not valid JSON`,
        );
      }
    } catch (err) {
      console.warn('loginUser exception', {baseUrl, err});
      return rejectWithValue('Network/exception error during login');
    }
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
        return rejectWithValue(
          errorText || `Reset password failed with status ${response.status}`,
        );
      }

      // backend might return empty body or JSON; we don't need it for the flow
      await response.text().catch(() => '');
      return {ok: true, email};
    } catch (err) {
      console.warn('requestResetPassword exception', {baseUrl, err});
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
        return rejectWithValue(
          errorText || `OTP verify failed with status ${response.status}`,
        );
      }

      try {
        const data = await response.json();
        return {ok: true, data};
      } catch (e) {
        const text = await response.text().catch(() => '');
        return {ok: true, data: {raw: text}};
      }
    } catch (err) {
      console.warn('verifyOtp exception', {baseUrl, err});
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
        return rejectWithValue(
          errorBody?.message ||
            errorBody?.error ||
            errorText ||
            `Reset password failed with status ${response.status}`,
        );
      }

      try {
        const data = await response.json();
        return {ok: true, data};
      } catch (e) {
        const text = await response.text().catch(() => '');
        return {ok: true, data: {raw: text}};
      }
    } catch (err) {
      console.warn('confirmResetPassword exception', {baseUrl, err});
      return rejectWithValue('Network/exception error during reset-password');
    }
  },
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
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
        state.logout = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.authStatus = 'failed';
        state.authError =
          (action.payload as string) || action.error.message || 'Login failed';
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
