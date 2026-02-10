import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {Platform} from 'react-native';

const getApiBaseUrl = () => {
  // For physical device dev, point to your machine LAN IP
  const manualHost = 'http://192.168.18.36:3000';
  const deviceHost =
    Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
  return manualHost?.trim() || deviceHost;
};

// GET /driver/details — backend auto-resolves employeeId from JWT token
export const fetchDriverDetails = createAsyncThunk(
  'driver/fetchDriverDetails',
  async (_: void, {getState, rejectWithValue}) => {
    const baseUrl = getApiBaseUrl();
    const state: any = getState();
    const token: string | null | undefined = state?.userSlices?.token;

    if (!token) {
      return rejectWithValue('Missing auth token');
    }

    try {
      const response = await fetch(`${baseUrl}/driver/details`, {
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
      // API shape: { ok: true, data: [ { EmployeeId, Name, Phone, Email, ... } ] }
      if (data?.ok === true && Array.isArray(data?.data)) {
        return data.data[0] ?? null;
      }
      return data;
    } catch (e) {
      return rejectWithValue('Network error while fetching driver details');
    }
  },
  {
    condition: (_: void, {getState}) => {
      const state: any = getState();
      const driverState = state?.driverSlices;
      const status: string | undefined = driverState?.driverDetailsStatus;

      // Dedupe: if already in flight or succeeded, skip
      if (status === 'loading' || status === 'succeeded') {
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

// =================== Routes by Date API ===================
// GET /driver/routes/by-date?date=YYYY-MM-DD
// Returns morning[] and evening[] routes with tripId + tripStatus
export const fetchRoutesByDate = createAsyncThunk(
  'driver/fetchRoutesByDate',
  async (date: string, {getState, rejectWithValue}) => {
    const baseUrl = getApiBaseUrl();
    const state: any = getState();
    const token: string | null | undefined = state?.userSlices?.token;

    if (!token) {
      return rejectWithValue('Missing auth token');
    }

    try {
      const response = await fetch(
        `${baseUrl}/driver/routes/by-date?date=${encodeURIComponent(date)}`,
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
          errorText || `Fetch routes by date failed with status ${response.status}`,
        );
      }

      const data = await response.json().catch(() => null);
      if (data?.ok === true && data?.data) {
        return data.data;
      }
      return data;
    } catch (e) {
      return rejectWithValue('Network error while fetching routes by date');
    }
  },
  {
    condition: (_: string, {getState}) => {
      const state: any = getState();
      const status: string | undefined = state?.driverSlices?.routesByDateStatus;
      if (status === 'loading') return false;
      return true;
    },
  },
);

// =================== Trip Start / End APIs ===================
// POST /driver/trips/:tripId/start
export const startTrip = createAsyncThunk(
  'driver/startTrip',
  async (tripId: number | string, {getState, rejectWithValue}) => {
    const baseUrl = getApiBaseUrl();
    const state: any = getState();
    const token: string | null | undefined = state?.userSlices?.token;

    if (!token) return rejectWithValue('Missing auth token');

    try {
      const response = await fetch(`${baseUrl}/driver/trips/${tripId}/start`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        return rejectWithValue(
          errorText || `Start trip failed with status ${response.status}`,
        );
      }

      const data = await response.json().catch(() => null);
      return data;
    } catch (e) {
      return rejectWithValue('Network error while starting trip');
    }
  },
);

// POST /driver/trips/:tripId/end
export const endTrip = createAsyncThunk(
  'driver/endTrip',
  async (tripId: number | string, {getState, rejectWithValue}) => {
    const baseUrl = getApiBaseUrl();
    const state: any = getState();
    const token: string | null | undefined = state?.userSlices?.token;

    if (!token) return rejectWithValue('Missing auth token');

    try {
      const response = await fetch(`${baseUrl}/driver/trips/${tripId}/end`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        return rejectWithValue(
          errorText || `End trip failed with status ${response.status}`,
        );
      }

      const data = await response.json().catch(() => null);
      return data;
    } catch (e) {
      return rejectWithValue('Network error while ending trip');
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
      if (data?.ok === true && data?.data != null) {
        const payload = data.data;
        // Some APIs return array, some return object
        if (Array.isArray(payload)) {
          return payload[0] ?? null;
        }
        return payload;
      }
      // Sometimes API returns location at top-level
      if (data?.latitude != null && data?.longitude != null) {
        return data;
      }
      if (data?.Latitude != null && data?.Longitude != null) {
        return data;
      }
      return rejectWithValue('Invalid response format');
    } catch (err) {
      if (__DEV__) {
        console.warn('getVehicleLocation exception', {baseUrl, err});
      }
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
  routeId?: number | string | null;
  tripId?: number | string | null;
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
      routeId,
      tripId,
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
      // API expects: { latitude, longitude, speed?, heading?, timestamp?, routeId?, tripId? }
      const body: Record<string, any> = {
        latitude,
        longitude,
      };
      if (speed != null) body.speed = speed;
      if (heading != null) body.heading = heading;
      if (timestamp) body.timestamp = timestamp;
      if (routeId != null) body.routeId = Number(routeId);
      if (tripId != null) body.tripId = Number(tripId);

      if (__DEV__) {
        console.log('📡 API Request - Update Vehicle Location:');
        console.log('   URL:', `${baseUrl}/tracking/vehicles/${vehicleId}/location`);
        console.log('   Method: POST');
        console.log('   Body:', JSON.stringify(body, null, 2));
      }

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

      if (__DEV__) {
        console.log('📥 API Response Status:', response.status, response.statusText);
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        return rejectWithValue(
          errorText || `Update vehicle location failed with status ${response.status}`,
        );
      }

      const data = await response.json().catch(() => null);
      if (__DEV__) {
        console.log('📥 API Response Data:', JSON.stringify(data, null, 2));
      }
      
      if (data?.ok === true && data?.data) {
        if (__DEV__) {
          console.log('✅ Location update successful');
        }
        return data.data;
      }
      if (__DEV__) {
        console.log('⚠️ Location update response format:', data);
      }
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
    // Routes by date
    routesByDate: null as any,
    routesByDateStatus: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
    routesByDateError: null as string | null,
    // Active trip/route tracking
    activeRouteId: null as number | string | null,
    activeTripId: null as number | string | null,
    // Trip start/end
    tripStartStatus: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
    tripStartError: null as string | null,
    tripEndStatus: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
    tripEndError: null as string | null,
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
      state.showCreateGroup = payload;
    },
    setShowGroup: (state, {payload}) => {
      state.showGroup = payload;
    },
    setActiveRouteId: (state, {payload}) => {
      state.activeRouteId = payload;
    },
    setActiveTripId: (state, {payload}) => {
      state.activeTripId = payload;
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
        const prev = state.vehicleLocation as any;
        const lat = payload?.latitude ?? payload?.Latitude ?? null;
        const lng = payload?.longitude ?? payload?.Longitude ?? null;
        const prevLat = prev?.latitude ?? prev?.Latitude ?? null;
        const prevLng = prev?.longitude ?? prev?.Longitude ?? null;
        if (lat != null && lng != null && (prevLat !== lat || prevLng !== lng)) {
          state.vehicleLocation = payload;
        }
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
      })
      // ---- Routes by Date ----
      .addCase(fetchRoutesByDate.pending, state => {
        state.routesByDateStatus = 'loading';
        state.routesByDateError = null;
      })
      .addCase(fetchRoutesByDate.fulfilled, (state, {payload}) => {
        state.routesByDateStatus = 'succeeded';
        state.routesByDateError = null;
        state.routesByDate = payload;
        // Auto-pick first morning route's routeId + tripId if available
        const firstRoute =
          payload?.morning?.[0] ?? payload?.evening?.[0] ?? null;
        if (firstRoute) {
          if (firstRoute.routeId) state.activeRouteId = firstRoute.routeId;
          if (firstRoute.tripId) state.activeTripId = firstRoute.tripId;
        }
      })
      .addCase(fetchRoutesByDate.rejected, (state, action) => {
        state.routesByDateStatus = 'failed';
        state.routesByDateError =
          (action.payload as string) ||
          action.error.message ||
          'Failed to fetch routes by date';
      })
      // ---- Start Trip ----
      .addCase(startTrip.pending, state => {
        state.tripStartStatus = 'loading';
        state.tripStartError = null;
      })
      .addCase(startTrip.fulfilled, (state, {payload}) => {
        state.tripStartStatus = 'succeeded';
        state.tripStartError = null;
        if (payload?.tripId) state.activeTripId = payload.tripId;
      })
      .addCase(startTrip.rejected, (state, action) => {
        state.tripStartStatus = 'failed';
        state.tripStartError =
          (action.payload as string) ||
          action.error.message ||
          'Failed to start trip';
      })
      // ---- End Trip ----
      .addCase(endTrip.pending, state => {
        state.tripEndStatus = 'loading';
        state.tripEndError = null;
      })
      .addCase(endTrip.fulfilled, state => {
        state.tripEndStatus = 'succeeded';
        state.tripEndError = null;
        state.activeTripId = null;
      })
      .addCase(endTrip.rejected, (state, action) => {
        state.tripEndStatus = 'failed';
        state.tripEndError =
          (action.payload as string) ||
          action.error.message ||
          'Failed to end trip';
      });
  },
});

export const {
  setMaintenanceDetail,
  setStudentDetail,
  setChatTabIndex,
  setShowGroup,
  setShowCreateGroup,
  setActiveRouteId,
  setActiveTripId,
} = driverSlice.actions;

export default driverSlice.reducer;
