import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {Platform} from 'react-native';

const getApiBaseUrl = () => {
  // For physical device dev, point to your machine LAN IP
  const manualHost = 'http://192.168.18.36:3000';
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

// Get Vehicle Location for Driver
type GetVehicleLocationPayload = {
  vehicleId: number | string;
};

export const getVehicleLocation = createAsyncThunk(
  'driver/getVehicleLocation',
  async (
    {vehicleId}: GetVehicleLocationPayload,
    {getState, rejectWithValue},
  ) => {
    const baseUrl = getApiBaseUrl();
    const state: any = getState();
    const token: string | null | undefined = state?.userSlices?.token;

    if (!token) {
      return rejectWithValue('Missing auth token');
    }

    try {
      const response = await fetch(
        `${baseUrl}/tracking/vehicles/${vehicleId}/location`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        return rejectWithValue(
          errorText || `Get vehicle location failed with status ${response.status}`,
        );
      }

      const data = await response.json().catch(() => null);
      if (data?.ok === true && data?.data) {
        return data.data;
      }
      return rejectWithValue('Invalid response format');
    } catch (err) {
      console.warn('getVehicleLocation exception', {baseUrl, err});
      return rejectWithValue('Network error while fetching vehicle location');
    }
  },
);

// Update Vehicle Location (from GPS)
type UpdateVehicleLocationPayload = {
  vehicleId: number | string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  timestamp?: string;
};

export const updateVehicleLocation = createAsyncThunk(
  'driver/updateVehicleLocation',
  async (
    {
      vehicleId,
      latitude,
      longitude,
      speed,
      heading,
      timestamp,
    }: UpdateVehicleLocationPayload,
    {getState, rejectWithValue},
  ) => {
    const baseUrl = getApiBaseUrl();
    const state: any = getState();
    const token: string | null | undefined = state?.userSlices?.token;

    if (!token) {
      return rejectWithValue('Missing auth token');
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return rejectWithValue('Invalid coordinates');
    }

    try {
      const body: any = {
        latitude,
        longitude,
      };

      if (speed != null) body.speed = speed;
      if (heading != null) body.heading = heading;
      if (timestamp) body.timestamp = timestamp;

      console.log('📡 API Request - Update Vehicle Location:');
      console.log('   URL:', `${baseUrl}/tracking/vehicles/${vehicleId}/location`);
      console.log('   Method: POST');
      console.log('   Body:', JSON.stringify(body, null, 2));

      const response = await fetch(
        `${baseUrl}/tracking/vehicles/${vehicleId}/location`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          body: JSON.stringify(body),
        },
      );

      console.log('📥 API Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        return rejectWithValue(
          errorText || `Update vehicle location failed with status ${response.status}`,
        );
      }

      const data = await response.json().catch(() => null);
      console.log('📥 API Response Data:', JSON.stringify(data, null, 2));
      
      if (data?.ok === true && data?.data) {
        console.log('✅ Location update successful');
        return data.data;
      }
      console.log('⚠️ Location update response format:', data);
      return data;
    } catch (err) {
      console.warn('updateVehicleLocation exception', {baseUrl, err});
      return rejectWithValue('Network error while updating vehicle location');
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
    vehicleLocation: null as any,
    vehicleLocationStatus: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
    vehicleLocationError: null as string | null,
    updateLocationStatus: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
    updateLocationError: null as string | null,
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
      })
      .addCase(getVehicleLocation.pending, state => {
        state.vehicleLocationStatus = 'loading';
        state.vehicleLocationError = null;
      })
      .addCase(getVehicleLocation.fulfilled, (state, {payload}) => {
        state.vehicleLocationStatus = 'succeeded';
        state.vehicleLocationError = null;
        state.vehicleLocation = payload;
      })
      .addCase(getVehicleLocation.rejected, (state, action) => {
        state.vehicleLocationStatus = 'failed';
        state.vehicleLocationError =
          (action.payload as string) ||
          action.error.message ||
          'Failed to fetch vehicle location';
      })
      .addCase(updateVehicleLocation.pending, state => {
        state.updateLocationStatus = 'loading';
        state.updateLocationError = null;
      })
      .addCase(updateVehicleLocation.fulfilled, (state, {payload}) => {
        state.updateLocationStatus = 'succeeded';
        state.updateLocationError = null;
        // Optionally update vehicleLocation with the new location
        if (payload?.latitude && payload?.longitude) {
          state.vehicleLocation = payload;
        }
      })
      .addCase(updateVehicleLocation.rejected, (state, action) => {
        state.updateLocationStatus = 'failed';
        state.updateLocationError =
          (action.payload as string) ||
          action.error.message ||
          'Failed to update vehicle location';
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
