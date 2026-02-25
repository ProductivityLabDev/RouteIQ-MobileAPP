import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {getApiBaseUrl} from '../../utils/apiConfig';
import {showErrorToast, showSuccessToast} from '../../utils/toast';
import type {RootState} from '../store';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RFQItem {
  RequestId: number;
  RequestNumber: string;
  Status: 'Pending' | 'Reviewed' | 'Accepted' | 'Declined' | 'Completed';
  PickupDate: string;
  PickupTime: string;
  PickupLocation: string;
  DestinationLocation: string;
  QuotedAmount: number | null;
  CreatedAt: string;
  [key: string]: any;
}

export interface RetailProfile {
  Name: string;
  Email: string;
  Phone: string;
  Address: string;
  EmployeeId: number;
  companyName: string;
}

export interface DashboardStats {
  totalTrips: number;
  pendingTrips: number;
  totalSpend: number;
}

interface RetailerState {
  // Auth
  signupEmail: string | null;
  signupStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  signupError: string | null;

  verifyOtpStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  verifyOtpError: string | null;

  forgotEmail: string | null;
  forgotStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  forgotError: string | null;

  resetUserId: number | null;
  verifyResetStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  verifyResetError: string | null;

  resetPasswordStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  resetPasswordError: string | null;

  // Dashboard
  dashboard: {stats: DashboardStats; todayTrips: RFQItem[]; calendarData: any[]} | null;
  dashboardStatus: 'idle' | 'loading' | 'succeeded' | 'failed';

  // RFQ
  rfqList: RFQItem[];
  rfqListStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  rfqDetail: RFQItem | null;
  rfqDetailStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  rfqCreateStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  rfqUpdateStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  rfqError: string | null;

  // Profile
  profile: RetailProfile | null;
  profileStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  profileUpdateStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  profileError: string | null;

  // History
  history: RFQItem[];
  historyStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  historyError: string | null;
}

const initialState: RetailerState = {
  signupEmail: null,
  signupStatus: 'idle',
  signupError: null,

  verifyOtpStatus: 'idle',
  verifyOtpError: null,

  forgotEmail: null,
  forgotStatus: 'idle',
  forgotError: null,

  resetUserId: null,
  verifyResetStatus: 'idle',
  verifyResetError: null,

  resetPasswordStatus: 'idle',
  resetPasswordError: null,

  dashboard: null,
  dashboardStatus: 'idle',

  rfqList: [],
  rfqListStatus: 'idle',
  rfqDetail: null,
  rfqDetailStatus: 'idle',
  rfqCreateStatus: 'idle',
  rfqUpdateStatus: 'idle',
  rfqError: null,

  profile: null,
  profileStatus: 'idle',
  profileUpdateStatus: 'idle',
  profileError: null,

  history: [],
  historyStatus: 'idle',
  historyError: null,
};

// ─── Auth Thunks ─────────────────────────────────────────────────────────────

export const retailerSignup = createAsyncThunk(
  'retailer/signup',
  async (
    data: {name: string; username: string; email: string; password: string; confirmPassword: string},
    {rejectWithValue},
  ) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/retailer/auth/signup`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        showErrorToast('Signup failed', json.message || 'Please try again');
        return rejectWithValue(json.message || 'Signup failed');
      }
      showSuccessToast('Account created', 'Check your email for OTP');
      return {email: data.email};
    } catch (e: any) {
      showErrorToast('Signup failed', 'Network error');
      return rejectWithValue(e.message || 'Network error');
    }
  },
);

export const retailerVerifySignupOtp = createAsyncThunk(
  'retailer/verifySignupOtp',
  async (data: {email: string; otp: string}, {rejectWithValue}) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/retailer/auth/verify-otp`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        showErrorToast('Verification failed', json.message || 'Invalid or expired OTP');
        return rejectWithValue(json.message || 'OTP verification failed');
      }
      showSuccessToast('Verified!', 'You can now login');
      return json;
    } catch (e: any) {
      showErrorToast('Verification failed', 'Network error');
      return rejectWithValue(e.message || 'Network error');
    }
  },
);

export const retailerForgotPassword = createAsyncThunk(
  'retailer/forgotPassword',
  async (data: {usernameOrEmail: string}, {rejectWithValue}) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/retailer/auth/forgot-password`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({usernameOrEmail: data.usernameOrEmail}),
      });
      const json = await res.json();
      if (!res.ok) {
        showErrorToast('Request failed', json.message || 'Please try again');
        return rejectWithValue(json.message || 'Request failed');
      }
      showSuccessToast('OTP sent', 'Check your email');
      return {email: data.usernameOrEmail};
    } catch (e: any) {
      showErrorToast('Request failed', 'Network error');
      return rejectWithValue(e.message || 'Network error');
    }
  },
);

export const retailerVerifyResetOtp = createAsyncThunk(
  'retailer/verifyResetOtp',
  async (data: {email: string; otp: string}, {rejectWithValue}) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/retailer/auth/verify-reset-otp`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showErrorToast('Verification failed', json.message || 'Invalid or expired OTP');
        return rejectWithValue(json.message || 'OTP verification failed');
      }
      showSuccessToast('OTP verified', 'Set your new password');
      return json; // includes userId
    } catch (e: any) {
      showErrorToast('Verification failed', 'Network error');
      return rejectWithValue(e.message || 'Network error');
    }
  },
);

export const retailerResetPassword = createAsyncThunk(
  'retailer/resetPassword',
  async (data: {userId: number; newPassword: string}, {rejectWithValue}) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/retailer/auth/reset-password`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showErrorToast('Reset failed', json.message || 'Please try again');
        return rejectWithValue(json.message || 'Reset failed');
      }
      showSuccessToast('Password reset!', 'You can now login');
      return json;
    } catch (e: any) {
      showErrorToast('Reset failed', 'Network error');
      return rejectWithValue(e.message || 'Network error');
    }
  },
);

// ─── Authenticated Thunks ─────────────────────────────────────────────────────

const authHeader = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export const fetchRetailDashboard = createAsyncThunk(
  'retailer/fetchDashboard',
  async (params: {date?: string; month?: number; year?: number} | undefined, {getState, rejectWithValue}) => {
    const token = (getState() as RootState).userSlices.token;
    if (!token) {
      console.warn('[Retail Dashboard] No token');
      return rejectWithValue('Not logged in');
    }
    try {
      const query = params
        ? `?${new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()}`
        : '';
      const url = `${getApiBaseUrl()}/retailer/dashboard${query}`;
      console.log('[Retail Dashboard] Fetching:', url);
      const res = await fetch(url, {
        method: 'GET',
        headers: {...authHeader(token), Accept: 'application/json'},
      });
      const json = await res.json();
      if (!res.ok) {
        console.warn('[Retail Dashboard] Failed', res.status, json);
        return rejectWithValue(json?.message || json?.error || 'Failed');
      }
      const raw = json?.data ?? json;
      if (!raw || typeof raw !== 'object') {
        console.warn('[Retail Dashboard] No data in response', json);
        return rejectWithValue('No data');
      }
      const stats = raw?.stats ?? {};
      const totalTrips = stats?.totalTrips ?? stats?.TotalTrips ?? (Array.isArray(raw?.todayTrips) ? raw.todayTrips.length : 0);
      const pendingTrips = stats?.pendingTrips ?? stats?.PendingTrips ?? 0;
      const totalSpend = stats?.totalSpend ?? stats?.TotalSpend ?? 0;
      const todayTrips = raw?.todayTrips ?? raw?.TodayTrips ?? [];
      const payload = {
        stats: { totalTrips, pendingTrips, totalSpend },
        todayTrips,
        calendarData: raw?.calendarData ?? raw?.calendar ?? [],
        selectedDate: raw?.selectedDate,
        month: raw?.month,
        year: raw?.year,
      };
      console.log('[Retail Dashboard] OK | totalTrips:', payload.stats.totalTrips, '| pendingTrips:', payload.stats.pendingTrips, '| todayTrips:', payload.todayTrips?.length);
      return payload;
    } catch (e: any) {
      console.warn('[Retail Dashboard] Error', e?.message || e);
      return rejectWithValue(e?.message || 'Network error');
    }
  },
);

export const fetchRetailRFQList = createAsyncThunk(
  'retailer/fetchRFQList',
  async (
    params: {status?: string; limit?: number; offset?: number} | undefined,
    {getState, rejectWithValue},
  ) => {
    const token = (getState() as RootState).userSlices.token;
    try {
      const query = params
        ? `?${new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()}`
        : '';
      const res = await fetch(`${getApiBaseUrl()}/retailer/rfq${query}`, {
        headers: authHeader(token),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) return rejectWithValue(json.message || 'Failed');
      return json.data as RFQItem[];
    } catch (e: any) {
      return rejectWithValue(e.message || 'Network error');
    }
  },
);

export const fetchRetailRFQDetail = createAsyncThunk(
  'retailer/fetchRFQDetail',
  async (id: number, {getState, rejectWithValue}) => {
    const token = (getState() as RootState).userSlices.token;
    try {
      const res = await fetch(`${getApiBaseUrl()}/retailer/rfq?id=${id}`, {
        headers: authHeader(token),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) return rejectWithValue(json.message || 'Failed');
      return json.data as RFQItem;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Network error');
    }
  },
);

export const createRetailRFQ = createAsyncThunk(
  'retailer/createRFQ',
  async (data: Record<string, any>, {getState, rejectWithValue}) => {
    const token = (getState() as RootState).userSlices.token;
    try {
      const res = await fetch(`${getApiBaseUrl()}/retailer/rfq`, {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        showErrorToast('Failed', json.message || 'Could not create RFQ');
        return rejectWithValue(json.message || 'Failed');
      }
      showSuccessToast('RFQ Submitted!', `Request #${json.data?.requestNumber} created`);
      return json.data;
    } catch (e: any) {
      showErrorToast('Failed', 'Network error');
      return rejectWithValue(e.message || 'Network error');
    }
  },
);

export const updateRetailRFQ = createAsyncThunk(
  'retailer/updateRFQ',
  async (payload: {id: number; data: Record<string, any>}, {getState, rejectWithValue}) => {
    const token = (getState() as RootState).userSlices.token;
    try {
      const res = await fetch(`${getApiBaseUrl()}/retailer/rfq?id=${payload.id}`, {
        method: 'PATCH',
        headers: authHeader(token),
        body: JSON.stringify(payload.data),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        showErrorToast('Update failed', json.message || 'Could not update RFQ');
        return rejectWithValue(json.message || 'Failed');
      }
      showSuccessToast('Updated!', 'RFQ updated successfully');
      return {id: payload.id};
    } catch (e: any) {
      showErrorToast('Update failed', 'Network error');
      return rejectWithValue(e.message || 'Network error');
    }
  },
);

export const fetchRetailProfile = createAsyncThunk(
  'retailer/fetchProfile',
  async (_, {getState, rejectWithValue}) => {
    const token = (getState() as RootState).userSlices.token;
    try {
      const res = await fetch(`${getApiBaseUrl()}/retailer/profile`, {
        headers: authHeader(token),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) return rejectWithValue(json.message || 'Failed');
      return json.data as RetailProfile;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Network error');
    }
  },
);

export const updateRetailProfile = createAsyncThunk(
  'retailer/updateProfile',
  async (
    data: {name?: string; address?: string; phone?: string; email?: string},
    {getState, rejectWithValue},
  ) => {
    const token = (getState() as RootState).userSlices.token;
    try {
      const res = await fetch(`${getApiBaseUrl()}/retailer/profile`, {
        method: 'PATCH',
        headers: authHeader(token),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        showErrorToast('Update failed', json.message || 'Could not update profile');
        return rejectWithValue(json.message || 'Failed');
      }
      showSuccessToast('Profile updated!', 'Changes saved successfully');
      return data;
    } catch (e: any) {
      showErrorToast('Update failed', 'Network error');
      return rejectWithValue(e.message || 'Network error');
    }
  },
);

export const fetchRetailHistory = createAsyncThunk(
  'retailer/fetchHistory',
  async (
    params: {limit?: number; offset?: number} | undefined,
    {getState, rejectWithValue},
  ) => {
    const token = (getState() as RootState).userSlices.token;
    try {
      const query = params
        ? `?${new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()}`
        : '';
      const url = `${getApiBaseUrl()}/retailer/history${query}`;
      console.log('[RetailHistory] Fetching:', url, '| token:', token ? 'present' : 'missing');
      const res = await fetch(url, {headers: authHeader(token)});
      const json = await res.json();
      console.log('[RetailHistory] Response status:', res.status, '| ok:', json.ok, '| data length:', Array.isArray(json.data) ? json.data.length : json.data);
      if (!res.ok || !json.ok) return rejectWithValue(json.message || 'Failed');
      return json.data as RFQItem[];
    } catch (e: any) {
      console.log('[RetailHistory] Fetch error:', e.message);
      return rejectWithValue(e.message || 'Network error');
    }
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const retailerSlice = createSlice({
  name: 'retailer',
  initialState,
  reducers: {
    clearRetailRFQDetail(state) {
      state.rfqDetail = null;
      state.rfqDetailStatus = 'idle';
    },
    clearRetailAuth(state) {
      state.signupEmail = null;
      state.forgotEmail = null;
      state.resetUserId = null;
    },
  },
  extraReducers: builder => {
    // Signup
    builder
      .addCase(retailerSignup.pending, state => {
        state.signupStatus = 'loading';
        state.signupError = null;
      })
      .addCase(retailerSignup.fulfilled, (state, {payload}) => {
        state.signupStatus = 'succeeded';
        state.signupEmail = payload.email;
      })
      .addCase(retailerSignup.rejected, (state, action) => {
        state.signupStatus = 'failed';
        state.signupError = action.payload as string;
      });

    // Verify signup OTP
    builder
      .addCase(retailerVerifySignupOtp.pending, state => {
        state.verifyOtpStatus = 'loading';
        state.verifyOtpError = null;
      })
      .addCase(retailerVerifySignupOtp.fulfilled, state => {
        state.verifyOtpStatus = 'succeeded';
        state.signupEmail = null;
      })
      .addCase(retailerVerifySignupOtp.rejected, (state, action) => {
        state.verifyOtpStatus = 'failed';
        state.verifyOtpError = action.payload as string;
      });

    // Forgot password
    builder
      .addCase(retailerForgotPassword.pending, state => {
        state.forgotStatus = 'loading';
        state.forgotError = null;
      })
      .addCase(retailerForgotPassword.fulfilled, (state, {payload}) => {
        state.forgotStatus = 'succeeded';
        state.forgotEmail = (payload as any).email ?? null;
      })
      .addCase(retailerForgotPassword.rejected, (state, action) => {
        state.forgotStatus = 'failed';
        state.forgotError = action.payload as string;
      });

    // Verify reset OTP
    builder
      .addCase(retailerVerifyResetOtp.pending, state => {
        state.verifyResetStatus = 'loading';
        state.verifyResetError = null;
      })
      .addCase(retailerVerifyResetOtp.fulfilled, (state, {payload}) => {
        state.verifyResetStatus = 'succeeded';
        state.resetUserId = (payload as any).userId ?? null;
      })
      .addCase(retailerVerifyResetOtp.rejected, (state, action) => {
        state.verifyResetStatus = 'failed';
        state.verifyResetError = action.payload as string;
      });

    // Reset password
    builder
      .addCase(retailerResetPassword.pending, state => {
        state.resetPasswordStatus = 'loading';
        state.resetPasswordError = null;
      })
      .addCase(retailerResetPassword.fulfilled, state => {
        state.resetPasswordStatus = 'succeeded';
        state.resetUserId = null;
        state.forgotEmail = null;
      })
      .addCase(retailerResetPassword.rejected, (state, action) => {
        state.resetPasswordStatus = 'failed';
        state.resetPasswordError = action.payload as string;
      });

    // Dashboard
    builder
      .addCase(fetchRetailDashboard.pending, state => {
        state.dashboardStatus = 'loading';
        state.dashboard = null;
      })
      .addCase(fetchRetailDashboard.fulfilled, (state, {payload}) => {
        state.dashboardStatus = 'succeeded';
        state.dashboard = payload && typeof payload === 'object' ? payload : null;
      })
      .addCase(fetchRetailDashboard.rejected, state => {
        state.dashboardStatus = 'failed';
      });

    // RFQ List
    builder
      .addCase(fetchRetailRFQList.pending, state => {
        state.rfqListStatus = 'loading';
        state.rfqError = null;
      })
      .addCase(fetchRetailRFQList.fulfilled, (state, {payload}) => {
        state.rfqListStatus = 'succeeded';
        state.rfqList = payload;
      })
      .addCase(fetchRetailRFQList.rejected, (state, action) => {
        state.rfqListStatus = 'failed';
        state.rfqError = action.payload as string;
      });

    // RFQ Detail
    builder
      .addCase(fetchRetailRFQDetail.pending, state => {
        state.rfqDetailStatus = 'loading';
      })
      .addCase(fetchRetailRFQDetail.fulfilled, (state, {payload}) => {
        state.rfqDetailStatus = 'succeeded';
        state.rfqDetail = payload;
      })
      .addCase(fetchRetailRFQDetail.rejected, state => {
        state.rfqDetailStatus = 'failed';
      });

    // Create RFQ
    builder
      .addCase(createRetailRFQ.pending, state => {
        state.rfqCreateStatus = 'loading';
      })
      .addCase(createRetailRFQ.fulfilled, state => {
        state.rfqCreateStatus = 'succeeded';
        state.rfqListStatus = 'idle'; // force re-fetch
      })
      .addCase(createRetailRFQ.rejected, state => {
        state.rfqCreateStatus = 'failed';
      });

    // Update RFQ
    builder
      .addCase(updateRetailRFQ.pending, state => {
        state.rfqUpdateStatus = 'loading';
      })
      .addCase(updateRetailRFQ.fulfilled, state => {
        state.rfqUpdateStatus = 'succeeded';
        state.rfqListStatus = 'idle'; // force re-fetch
      })
      .addCase(updateRetailRFQ.rejected, state => {
        state.rfqUpdateStatus = 'failed';
      });

    // Profile
    builder
      .addCase(fetchRetailProfile.pending, state => {
        state.profileStatus = 'loading';
        state.profileError = null;
      })
      .addCase(fetchRetailProfile.fulfilled, (state, {payload}) => {
        state.profileStatus = 'succeeded';
        state.profile = payload;
      })
      .addCase(fetchRetailProfile.rejected, (state, action) => {
        state.profileStatus = 'failed';
        state.profileError = action.payload as string;
      });

    // Update Profile
    builder
      .addCase(updateRetailProfile.pending, state => {
        state.profileUpdateStatus = 'loading';
      })
      .addCase(updateRetailProfile.fulfilled, (state, {payload}) => {
        state.profileUpdateStatus = 'succeeded';
        if (state.profile) {
          if (payload.name) state.profile.Name = payload.name;
          if (payload.address) state.profile.Address = payload.address;
          if (payload.phone) state.profile.Phone = payload.phone;
          if (payload.email) state.profile.Email = payload.email;
        }
      })
      .addCase(updateRetailProfile.rejected, state => {
        state.profileUpdateStatus = 'failed';
      });

    // History
    builder
      .addCase(fetchRetailHistory.pending, state => {
        state.historyStatus = 'loading';
        state.historyError = null;
      })
      .addCase(fetchRetailHistory.fulfilled, (state, {payload}) => {
        state.historyStatus = 'succeeded';
        state.history = payload;
      })
      .addCase(fetchRetailHistory.rejected, (state, action) => {
        state.historyStatus = 'failed';
        state.historyError = action.payload as string;
      });
  },
});

export const {clearRetailRFQDetail, clearRetailAuth} = retailerSlice.actions;
export default retailerSlice.reducer;
