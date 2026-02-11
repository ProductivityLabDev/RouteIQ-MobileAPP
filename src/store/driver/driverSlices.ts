import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {getApiBaseUrl} from '../../utils/apiConfig';

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
      const endpoint = `${baseUrl}/driver/details`;
      if (__DEV__) {
        console.log('📡 GET /driver/details URL:', endpoint);
      }
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        if (__DEV__) {
          console.warn(
            '❌ GET /driver/details failed:',
            response.status,
            errorText,
          );
        }
        return rejectWithValue(
          errorText || `Driver details failed with status ${response.status}`,
        );
      }

      const data = await response.json().catch(() => null);
      if (__DEV__) {
        console.log('✅ GET /driver/details response:', data);
      }
      // API shape: { ok: true, data: [ { EmployeeId, Name, Phone, Email, ... } ] }
      if (data?.ok === true && Array.isArray(data?.data)) {
        return data.data[0] ?? null;
      }
      return data;
    } catch (e) {
      if (__DEV__) {
        console.warn('❌ GET /driver/details network error:', e);
      }
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

// =================== Emergency Contacts ===================
// GET driver/emergency-contacts
export const fetchEmergencyContacts = createAsyncThunk(
  'driver/fetchEmergencyContacts',
  async (_: void, {getState, rejectWithValue}) => {
    const baseUrl = getApiBaseUrl();
    const state: any = getState();
    const token: string | null | undefined = state?.userSlices?.token;

    if (!token) return rejectWithValue('Missing auth token');

    const fullUrl = `${baseUrl}/driver/emergency-contacts`;
    if (__DEV__) console.log('🌐 GET', fullUrl);

    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        if (__DEV__) {
          console.warn('❌ GET emergency-contacts failed:', fullUrl, '| status:', response.status, '|', errorText);
        }
        return rejectWithValue(
          errorText || `Fetch emergency contacts failed with status ${response.status}`,
        );
      }

      const data = await response.json().catch(() => null);
      let list: any[] = [];
      if (data?.ok === true && Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data)) {
        list = data;
      }
      if (__DEV__) {
        console.log('📡 GET emergency-contacts response:', { ok: data?.ok, count: list?.length, list });
      }
      return list;
    } catch (e) {
      if (__DEV__) {
        console.warn('❌ fetchEmergencyContacts NETWORK ERROR:', fullUrl, '|', e);
        console.warn('   → Check: Backend running? Phone & PC same WiFi? IP in apiConfig = PC IP?');
      }
      return rejectWithValue('Network error while fetching emergency contacts');
    }
  },
);

// POST driver/emergency-contacts
// Backend: contactName, relationship, phoneNumber, alternatePhone?, email?, address?, isPrimary?
export type AddEmergencyContactPayload = {
  contactName: string;
  relationship: string;
  phoneNumber: string;
  alternatePhone?: string | null;
  email?: string | null;
  address?: string | null;
  isPrimary?: number | boolean | null;
};

export const addEmergencyContact = createAsyncThunk(
  'driver/addEmergencyContact',
  async (body: AddEmergencyContactPayload, {getState, rejectWithValue}) => {
    const baseUrl = getApiBaseUrl();
    const state: any = getState();
    const token: string | null | undefined = state?.userSlices?.token;

    if (!token) return rejectWithValue('Missing auth token');

    const payload = {
      contactName: body.contactName,
      relationship: body.relationship,
      phoneNumber: body.phoneNumber,
      alternatePhone: body.alternatePhone ?? null,
      email: body.email ?? null,
      address: body.address ?? null,
      isPrimary: body.isPrimary != null ? (typeof body.isPrimary === 'boolean' ? (body.isPrimary ? 1 : 0) : Number(body.isPrimary)) : 0,
    };

    try {
      const endpoint = `${baseUrl}/driver/emergency-contacts`;
      if (__DEV__) {
        console.log('📡 POST /driver/emergency-contacts URL:', endpoint);
        console.log('📡 POST /driver/emergency-contacts BODY:', payload);
      }
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        if (__DEV__) {
          console.warn(
            '❌ addEmergencyContact failed:',
            response.status,
            errorText,
          );
        }
        return rejectWithValue(
          errorText || `Add emergency contact failed with status ${response.status}`,
        );
      }

      const data = await response.json().catch(() => null);
      if (__DEV__) {
        console.log('✅ addEmergencyContact success:', data);
      }
      return data?.data ?? data;
    } catch (e) {
      if (__DEV__) {
        console.warn('❌ addEmergencyContact network error:', e);
      }
      return rejectWithValue('Network error while adding emergency contact');
    }
  },
);

// PATCH driver/emergency-contacts/:id
// Backend: contactName?, relationship?, phoneNumber?, alternatePhone?, email?, address?, isPrimary?
export type UpdateEmergencyContactPayload = {
  id: number | string; // ContactId
  contactName?: string | null;
  relationship?: string | null;
  phoneNumber?: string | null;
  alternatePhone?: string | null;
  email?: string | null;
  address?: string | null;
  isPrimary?: number | boolean | null;
};

export const updateEmergencyContact = createAsyncThunk(
  'driver/updateEmergencyContact',
  async (
    {id, ...rest}: UpdateEmergencyContactPayload,
    {getState, rejectWithValue},
  ) => {
    const baseUrl = getApiBaseUrl();
    const state: any = getState();
    const token: string | null | undefined = state?.userSlices?.token;

    if (!token) return rejectWithValue('Missing auth token');

    const body: Record<string, any> = {};
    if (rest.contactName != null) body.contactName = rest.contactName;
    if (rest.relationship != null) body.relationship = rest.relationship;
    if (rest.phoneNumber != null) body.phoneNumber = rest.phoneNumber;
    if (rest.alternatePhone != null) body.alternatePhone = rest.alternatePhone;
    if (rest.email != null) body.email = rest.email;
    if (rest.address != null) body.address = rest.address;
    if (rest.isPrimary != null) body.isPrimary = typeof rest.isPrimary === 'boolean' ? (rest.isPrimary ? 1 : 0) : Number(rest.isPrimary);

    try {
      const response = await fetch(
        `${baseUrl}/driver/emergency-contacts/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        return rejectWithValue(
          errorText ||
            `Update emergency contact failed with status ${response.status}`,
        );
      }

      const data = await response.json().catch(() => null);
      return data?.data ?? data;
    } catch (e) {
      return rejectWithValue('Network error while updating emergency contact');
    }
  },
);

// DELETE driver/emergency-contacts/:id
export const deleteEmergencyContact = createAsyncThunk(
  'driver/deleteEmergencyContact',
  async (id: number | string, {getState, rejectWithValue}) => {
    const baseUrl = getApiBaseUrl();
    const state: any = getState();
    const token: string | null | undefined = state?.userSlices?.token;

    if (!token) return rejectWithValue('Missing auth token');

    try {
      const response = await fetch(
        `${baseUrl}/driver/emergency-contacts/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        return rejectWithValue(
          errorText ||
            `Delete emergency contact failed with status ${response.status}`,
        );
      }

      return id;
    } catch (e) {
      return rejectWithValue('Network error while deleting emergency contact');
    }
  },
);

// =================== Education Levels & Fields (for qualifications) ===================
// GET driver/education/levels — Level dropdown (Matric, Bachelor, …)
export const fetchEducationLevels = createAsyncThunk(
  'driver/fetchEducationLevels',
  async (_: void, {getState, rejectWithValue}) => {
    const baseUrl = getApiBaseUrl();
    const state: any = getState();
    const token: string | null | undefined = state?.userSlices?.token;

    if (!token) return rejectWithValue('Missing auth token');

    try {
      const response = await fetch(`${baseUrl}/driver/education/levels`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        return rejectWithValue(
          errorText ||
            `Fetch education levels failed with status ${response.status}`,
        );
      }

      const data = await response.json().catch(() => null);
      if (data?.ok === true && Array.isArray(data?.data)) return data.data;
      if (data?.ok === true && Array.isArray(data?.data?.levels))
        return data.data.levels;
      if (Array.isArray(data?.levels)) return data.levels;
      if (Array.isArray(data)) return data;
      return [];
    } catch (e) {
      return rejectWithValue(
        'Network error while fetching education levels',
      );
    }
  },
);

// GET driver/education/levels/:levelId/fields — Field dropdown (B.Com, BCS, …)
export const fetchEducationFields = createAsyncThunk(
  'driver/fetchEducationFields',
  async (levelId: number | string, {getState, rejectWithValue}) => {
    const baseUrl = getApiBaseUrl();
    const state: any = getState();
    const token: string | null | undefined = state?.userSlices?.token;

    if (!token) return rejectWithValue('Missing auth token');

    try {
      const response = await fetch(
        `${baseUrl}/driver/education/levels/${levelId}/fields`,
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
          errorText ||
            `Fetch education fields failed with status ${response.status}`,
        );
      }

      const data = await response.json().catch(() => null);
      if (data?.ok === true && Array.isArray(data?.data)) return data.data;
      if (data?.ok === true && Array.isArray(data?.data?.fields))
        return data.data.fields;
      if (Array.isArray(data?.fields)) return data.fields;
      if (Array.isArray(data)) return data;
      return [];
    } catch (e) {
      return rejectWithValue(
        'Network error while fetching education fields',
      );
    }
  },
);

// =================== Driver Qualifications ===================
// GET driver/qualifications
export const fetchQualifications = createAsyncThunk(
  'driver/fetchQualifications',
  async (_: void, {getState, rejectWithValue}) => {
    const baseUrl = getApiBaseUrl();
    const state: any = getState();
    const token: string | null | undefined = state?.userSlices?.token;

    if (!token) return rejectWithValue('Missing auth token');

    try {
      const endpoint = `${baseUrl}/driver/qualifications`;
      if (__DEV__) {
        console.log('📡 GET /driver/qualifications URL:', endpoint);
      }
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        if (__DEV__) {
          console.warn(
            '❌ GET /driver/qualifications failed:',
            response.status,
            errorText,
          );
        }
        return rejectWithValue(
          errorText || `Fetch qualifications failed with status ${response.status}`,
        );
      }

      const data = await response.json().catch(() => null);
      if (__DEV__) {
        const rawList = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];
        console.log('✅ GET /driver/qualifications response:', data);
        console.log('✅ GET /driver/qualifications count:', rawList.length);
      }
      if (data?.ok === true && Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data)) return data;
      return [];
    } catch (e) {
      if (__DEV__) {
        console.warn('❌ GET /driver/qualifications network error:', e);
      }
      return rejectWithValue('Network error while fetching qualifications');
    }
  },
);

// POST driver/qualifications
export type AddQualificationPayload = {
  levelId?: number | string;
  fieldId?: number | string;
  jobTitle?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  [key: string]: any;
};

export const addQualification = createAsyncThunk(
  'driver/addQualification',
  async (body: AddQualificationPayload, {getState, rejectWithValue}) => {
    const baseUrl = getApiBaseUrl();
    const state: any = getState();
    const token: string | null | undefined = state?.userSlices?.token;

    if (!token) return rejectWithValue('Missing auth token');

    try {
      const endpoint = `${baseUrl}/driver/qualifications`;
      if (__DEV__) {
        console.log('📡 POST /driver/qualifications URL:', endpoint);
        console.log('📡 POST /driver/qualifications BODY:', body);
      }
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        if (__DEV__) {
          console.warn(
            '❌ addQualification failed:',
            response.status,
            errorText,
          );
        }
        return rejectWithValue(
          errorText || `Add qualification failed with status ${response.status}`,
        );
      }

      const data = await response.json().catch(() => null);
      if (__DEV__) {
        console.log('✅ addQualification success:', data);
      }
      return data?.data ?? data;
    } catch (e) {
      if (__DEV__) {
        console.warn('❌ addQualification network error:', e);
      }
      return rejectWithValue('Network error while adding qualification');
    }
  },
);

// PATCH driver/qualifications/:id
export type UpdateQualificationPayload = {
  id: number | string;
  jobTitle?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  [key: string]: any;
};

export const updateQualification = createAsyncThunk(
  'driver/updateQualification',
  async (
    {id, ...body}: UpdateQualificationPayload,
    {getState, rejectWithValue},
  ) => {
    const baseUrl = getApiBaseUrl();
    const state: any = getState();
    const token: string | null | undefined = state?.userSlices?.token;

    if (!token) return rejectWithValue('Missing auth token');

    try {
      const response = await fetch(`${baseUrl}/driver/qualifications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        return rejectWithValue(
          errorText ||
            `Update qualification failed with status ${response.status}`,
        );
      }

      const data = await response.json().catch(() => null);
      return data?.data ?? data;
    } catch (e) {
      return rejectWithValue('Network error while updating qualification');
    }
  },
);

// DELETE driver/qualifications/:id
export const deleteQualification = createAsyncThunk(
  'driver/deleteQualification',
  async (id: number | string, {getState, rejectWithValue}) => {
    const baseUrl = getApiBaseUrl();
    const state: any = getState();
    const token: string | null | undefined = state?.userSlices?.token;

    if (!token) return rejectWithValue('Missing auth token');

    try {
      const response = await fetch(`${baseUrl}/driver/qualifications/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        return rejectWithValue(
          errorText ||
            `Delete qualification failed with status ${response.status}`,
        );
      }

      return id;
    } catch (e) {
      return rejectWithValue('Network error while deleting qualification');
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
    // Emergency contacts
    emergencyContacts: [] as any[],
    emergencyContactsStatus: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
    emergencyContactsError: null as string | null,
    emergencyContactMutateStatus: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
    emergencyContactMutateError: null as string | null,
    // Qualifications
    qualifications: [] as any[],
    qualificationsStatus: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
    qualificationsError: null as string | null,
    qualificationMutateStatus: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
    qualificationMutateError: null as string | null,
    // Education levels & fields (for qualification dropdowns)
    educationLevels: [] as any[],
    educationLevelsStatus: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
    educationLevelsError: null as string | null,
    educationFields: [] as any[],
    educationFieldsStatus: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
    educationFieldsError: null as string | null,
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
      })
      // ---- Emergency Contacts (List) ----
      .addCase(fetchEmergencyContacts.pending, state => {
        state.emergencyContactsStatus = 'loading';
        state.emergencyContactsError = null;
      })
      .addCase(fetchEmergencyContacts.fulfilled, (state, {payload}) => {
        state.emergencyContactsStatus = 'succeeded';
        state.emergencyContactsError = null;
        state.emergencyContacts = Array.isArray(payload) ? payload : [];
      })
      .addCase(fetchEmergencyContacts.rejected, (state, action) => {
        state.emergencyContactsStatus = 'failed';
        state.emergencyContactsError =
          (action.payload as string) ||
          action.error.message ||
          'Failed to fetch emergency contacts';
      })
      // ---- Emergency Contact Add/Update/Delete ----
      .addCase(addEmergencyContact.pending, state => {
        state.emergencyContactMutateStatus = 'loading';
        state.emergencyContactMutateError = null;
      })
      .addCase(addEmergencyContact.fulfilled, (state, {payload}) => {
        state.emergencyContactMutateStatus = 'succeeded';
        state.emergencyContactMutateError = null;
        // Backend returns { ok, message } only — no created row. Call fetchEmergencyContacts() to refresh list.
        if (payload && typeof payload === 'object' && (payload.ContactId ?? payload.contactId ?? payload.id)) {
          const exists = state.emergencyContacts.some(
            (c: any) => (c.ContactId ?? c.contactId ?? c.id) === (payload.ContactId ?? payload.contactId ?? payload.id),
          );
          if (!exists) state.emergencyContacts = [...state.emergencyContacts, payload];
        }
      })
      .addCase(addEmergencyContact.rejected, (state, action) => {
        state.emergencyContactMutateStatus = 'failed';
        state.emergencyContactMutateError =
          (action.payload as string) ||
          action.error.message ||
          'Failed to add emergency contact';
      })
      .addCase(updateEmergencyContact.pending, state => {
        state.emergencyContactMutateStatus = 'loading';
        state.emergencyContactMutateError = null;
      })
      .addCase(updateEmergencyContact.fulfilled, (state, {payload}) => {
        state.emergencyContactMutateStatus = 'succeeded';
        state.emergencyContactMutateError = null;
        // Backend returns { ok, message } — no updated row. Refetch list in screen if needed.
        if (payload && typeof payload === 'object') {
          const id = payload.ContactId ?? payload.contactId ?? payload.id ?? payload.Id;
          if (id != null) {
            const idx = state.emergencyContacts.findIndex(
              (c: any) => (c.ContactId ?? c.contactId ?? c.id ?? c.Id) === id,
            );
            if (idx >= 0) {
              const next = [...state.emergencyContacts];
              next[idx] = { ...next[idx], ...payload };
              state.emergencyContacts = next;
            }
          }
        }
      })
      .addCase(updateEmergencyContact.rejected, (state, action) => {
        state.emergencyContactMutateStatus = 'failed';
        state.emergencyContactMutateError =
          (action.payload as string) ||
          action.error.message ||
          'Failed to update emergency contact';
      })
      .addCase(deleteEmergencyContact.pending, state => {
        state.emergencyContactMutateStatus = 'loading';
        state.emergencyContactMutateError = null;
      })
      .addCase(deleteEmergencyContact.fulfilled, (state, {payload: id}) => {
        state.emergencyContactMutateStatus = 'succeeded';
        state.emergencyContactMutateError = null;
        state.emergencyContacts = state.emergencyContacts.filter(
          (c: any) => (c.ContactId ?? c.contactId ?? c.id ?? c.Id) !== id,
        );
      })
      .addCase(deleteEmergencyContact.rejected, (state, action) => {
        state.emergencyContactMutateStatus = 'failed';
        state.emergencyContactMutateError =
          (action.payload as string) ||
          action.error.message ||
          'Failed to delete emergency contact';
      })
      // ---- Education Levels ----
      .addCase(fetchEducationLevels.pending, state => {
        state.educationLevelsStatus = 'loading';
        state.educationLevelsError = null;
      })
      .addCase(fetchEducationLevels.fulfilled, (state, {payload}) => {
        state.educationLevelsStatus = 'succeeded';
        state.educationLevelsError = null;
        state.educationLevels = Array.isArray(payload) ? payload : [];
      })
      .addCase(fetchEducationLevels.rejected, (state, action) => {
        state.educationLevelsStatus = 'failed';
        state.educationLevelsError =
          (action.payload as string) ||
          action.error.message ||
          'Failed to fetch education levels';
      })
      // ---- Education Fields ----
      .addCase(fetchEducationFields.pending, state => {
        state.educationFieldsStatus = 'loading';
        state.educationFieldsError = null;
      })
      .addCase(fetchEducationFields.fulfilled, (state, {payload}) => {
        state.educationFieldsStatus = 'succeeded';
        state.educationFieldsError = null;
        state.educationFields = Array.isArray(payload) ? payload : [];
      })
      .addCase(fetchEducationFields.rejected, (state, action) => {
        state.educationFieldsStatus = 'failed';
        state.educationFieldsError =
          (action.payload as string) ||
          action.error.message ||
          'Failed to fetch education fields';
      })
      // ---- Qualifications (List) ----
      .addCase(fetchQualifications.pending, state => {
        state.qualificationsStatus = 'loading';
        state.qualificationsError = null;
      })
      .addCase(fetchQualifications.fulfilled, (state, {payload}) => {
        state.qualificationsStatus = 'succeeded';
        state.qualificationsError = null;
        state.qualifications = Array.isArray(payload) ? payload : [];
      })
      .addCase(fetchQualifications.rejected, (state, action) => {
        state.qualificationsStatus = 'failed';
        state.qualificationsError =
          (action.payload as string) ||
          action.error.message ||
          'Failed to fetch qualifications';
      })
      // ---- Qualification Add/Update/Delete ----
      .addCase(addQualification.pending, state => {
        state.qualificationMutateStatus = 'loading';
        state.qualificationMutateError = null;
      })
      .addCase(addQualification.fulfilled, (state, {payload}) => {
        state.qualificationMutateStatus = 'succeeded';
        state.qualificationMutateError = null;
        if (payload) {
          const id = payload?.QualificationId ?? payload?.qualificationId ?? payload?.id;
          const exists = state.qualifications.some(
            (q: any) => (q?.QualificationId ?? q?.qualificationId ?? q?.id) === id,
          );
          if (!exists) state.qualifications = [...state.qualifications, payload];
        }
      })
      .addCase(addQualification.rejected, (state, action) => {
        state.qualificationMutateStatus = 'failed';
        state.qualificationMutateError =
          (action.payload as string) ||
          action.error.message ||
          'Failed to add qualification';
      })
      .addCase(updateQualification.pending, state => {
        state.qualificationMutateStatus = 'loading';
        state.qualificationMutateError = null;
      })
      .addCase(updateQualification.fulfilled, (state, {payload}) => {
        state.qualificationMutateStatus = 'succeeded';
        state.qualificationMutateError = null;
        if (payload) {
          const id = payload?.QualificationId ?? payload?.qualificationId ?? payload?.id;
          const idx = state.qualifications.findIndex(
            (q: any) => (q?.QualificationId ?? q?.qualificationId ?? q?.id) === id,
          );
          if (idx >= 0) {
            const next = [...state.qualifications];
            next[idx] = {...next[idx], ...payload};
            state.qualifications = next;
          }
        }
      })
      .addCase(updateQualification.rejected, (state, action) => {
        state.qualificationMutateStatus = 'failed';
        state.qualificationMutateError =
          (action.payload as string) ||
          action.error.message ||
          'Failed to update qualification';
      })
      .addCase(deleteQualification.pending, state => {
        state.qualificationMutateStatus = 'loading';
        state.qualificationMutateError = null;
      })
      .addCase(deleteQualification.fulfilled, (state, {payload: id}) => {
        state.qualificationMutateStatus = 'succeeded';
        state.qualificationMutateError = null;
        state.qualifications = state.qualifications.filter(
          (q: any) => (q?.QualificationId ?? q?.qualificationId ?? q?.id) !== id,
        );
      })
      .addCase(deleteQualification.rejected, (state, action) => {
        state.qualificationMutateStatus = 'failed';
        state.qualificationMutateError =
          (action.payload as string) ||
          action.error.message ||
          'Failed to delete qualification';
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
