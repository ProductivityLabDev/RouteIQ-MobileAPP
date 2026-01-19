import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {Platform} from 'react-native';

const getApiBaseUrl = () => {
  // For physical device dev, point to your machine LAN IP
  const manualHost = 'http://192.168.18.14:3000';
  const deviceHost =
    Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
  return manualHost?.trim() || deviceHost;
};

export const fetchDriverDetails = createAsyncThunk(
  'driver/fetchDriverDetails',
  async (employeeId: number | string, {getState, rejectWithValue}) => {
    const baseUrl = getApiBaseUrl();
    const state: any = getState();
    const token: string | null | undefined = state?.userSlices?.token;

    if (!token) {
      return rejectWithValue('Missing auth token');
    }

    try {
      const response = await fetch(`${baseUrl}/driver/details/${employeeId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        return rejectWithValue(
          errorText || `Driver details failed with status ${response.status}`,
        );
      }

      const data = await response.json().catch(() => null);
      // Expected API shape (from Postman):
      // { ok: true, data: [ { EmployeeName, EmployeeId, Status, ... } ] }
      if (data?.ok === true && Array.isArray(data?.data)) {
        return data.data[0] ?? null;
      }
      return data;
    } catch (e) {
      return rejectWithValue('Network error while fetching driver details');
    }
  },
  {
    condition: (employeeId: number | string, {getState}) => {
      const state: any = getState();
      const driverState = state?.driverSlices;
      const status: string | undefined = driverState?.driverDetailsStatus;
      const details: any = driverState?.driverDetails;

      // Dedupe: if already in flight, skip
      if (status === 'loading') {
        return false;
      }

      // Dedupe: if already fetched for this employeeId, skip
      const currentId =
        details?.EmployeeId ?? details?.employeeId ?? details?.id ?? null;
      if (
        status === 'succeeded' &&
        currentId != null &&
        String(currentId) === String(employeeId)
      ) {
        return false;
      }

      return true;
    },
  },
);

export const changeDriverPassword = createAsyncThunk(
  'driver/changeDriverPassword',
  async (
    {
      currentPassword,
      newPassword,
      retypeNewPassword,
    }: {currentPassword: string; newPassword: string; retypeNewPassword: string},
    {getState, rejectWithValue},
  ) => {
    const baseUrl = getApiBaseUrl();
    const state: any = getState();
    const token: string | null | undefined = state?.userSlices?.token;

    if (!token) {
      return rejectWithValue('Missing auth token');
    }

    try {
      const response = await fetch(`${baseUrl}/driver/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({currentPassword, newPassword, retypeNewPassword}),
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
            `Change password failed with status ${response.status}`,
        );
      }

      const data = await response.json().catch(() => null);
      return data;
    } catch (e) {
      return rejectWithValue('Network error while changing password');
    }
  },
);

const driverSlice = createSlice({
  name: 'driver',
  initialState: {
    maintenanceDetail: null,
    chatTabIndex: 0,
    showCreateGroup: false,
    showGroup: false,
    studentDetail: {
      name: 'Jonney Barbo',
      image: require('../../assets/images/child1.jpg'),
      age: 5,
      emergency_contact: '8978675634',
      school_name: 'Oakwood Elementary School',
      transportation_preference: 'Van',
      medical_details: 'Oakwood Elementary School',
      guardians: [
        {
          name: 'Jacob Jones',
          relation: 'Uncle',
          phone_number: 'Phone Number',
        },
        {
          name: 'Sarah Jones',
          relation: 'Aunt',
          phone_number: '8978675634',
        },
      ],
    },
    driverDetails: null as any,
    driverDetailsStatus: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
    driverDetailsError: null as string | null,
    changePasswordStatus: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
    changePasswordError: null as string | null,
  },
  reducers: {
    setMaintenanceDetail: (state, {payload}) => {
      state.maintenanceDetail = payload;
    },
    setStudentDetail: (state, {payload}) => {
      state.studentDetail = payload;
    },
    setChatTabIndex: (state, {payload}) => {
      state.chatTabIndex = payload;
    },
    setShowCreateGroup: (state, {payload}) => {
      state.chatTabIndex = payload;
    },
    setShowGroup: (state, {payload}) => {
      state.chatTabIndex = payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchDriverDetails.pending, state => {
        state.driverDetailsStatus = 'loading';
        state.driverDetailsError = null;
      })
      .addCase(fetchDriverDetails.fulfilled, (state, {payload}) => {
        state.driverDetailsStatus = 'succeeded';
        state.driverDetailsError = null;
        state.driverDetails = payload;
      })
      .addCase(fetchDriverDetails.rejected, (state, action) => {
        state.driverDetailsStatus = 'failed';
        state.driverDetailsError =
          (action.payload as string) ||
          action.error.message ||
          'Failed to fetch driver details';
      })
      .addCase(changeDriverPassword.pending, state => {
        state.changePasswordStatus = 'loading';
        state.changePasswordError = null;
      })
      .addCase(changeDriverPassword.fulfilled, state => {
        state.changePasswordStatus = 'succeeded';
        state.changePasswordError = null;
      })
      .addCase(changeDriverPassword.rejected, (state, action) => {
        state.changePasswordStatus = 'failed';
        state.changePasswordError =
          (action.payload as string) ||
          action.error.message ||
          'Change password failed';
      });
  },
});

export const {
  setMaintenanceDetail,
  setStudentDetail,
  setChatTabIndex,
  setShowGroup,
  setShowCreateGroup,
} = driverSlice.actions;

export default driverSlice.reducer;
