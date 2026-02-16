import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {getApiBaseUrl} from '../../utils/apiConfig';
import type {RootState} from '../store';

export type NotificationItem = {
  NotificationId: number;
  Title?: string | null;
  Message?: string | null;
  NotificationType?: string | null;
  RelatedEntityType?: string | null;
  RelatedEntityId?: number | null;
  IsRead?: number | boolean | null;
  CreatedAt?: string | null;
};

type FetchNotificationsArgs = {
  limit?: number;
  offset?: number;
};

type NotificationsState = {
  items: NotificationItem[];
  listStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  listError: string | null;
  unreadCount: number;
  unreadStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  unreadError: string | null;
  unreadLastFetchedAt: number | null;
};

const initialState: NotificationsState = {
  items: [],
  listStatus: 'idle',
  listError: null,
  unreadCount: 0,
  unreadStatus: 'idle',
  unreadError: null,
  unreadLastFetchedAt: null,
};

const getAuthToken = (state: any): string | null => state?.userSlices?.token ?? null;

const normalizeList = (data: any): NotificationItem[] => {
  if (data?.ok === true && Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
};

const normalizeUnreadCount = (data: any): number => {
  const raw = data?.unreadCount ?? data?.data?.unreadCount ?? 0;
  const num = Number(raw);
  return Number.isFinite(num) ? num : 0;
};

export const fetchMyNotifications = createAsyncThunk(
  'notifications/fetchMyNotifications',
  async ({limit = 50, offset = 0}: FetchNotificationsArgs, {getState, rejectWithValue}) => {
    const baseUrl = getApiBaseUrl();
    const token = getAuthToken(getState());
    if (!token) return rejectWithValue('Missing auth token');

    const query = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });

    try {
      const endpoint = `${baseUrl}/notifications?${query.toString()}`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        return rejectWithValue(text || `Fetch notifications failed (${response.status})`);
      }
      const data = await response.json().catch(() => null);
      return normalizeList(data);
    } catch (e) {
      return rejectWithValue('Network error while fetching notifications');
    }
  },
  {
    condition: (_args, {getState}) => {
      const state: any = getState();
      const status: string | undefined = state?.notificationsSlices?.listStatus;
      if (status === 'loading') return false;
      return true;
    },
  },
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async ({force = false}: {force?: boolean} = {}, {getState, rejectWithValue}) => {
    const baseUrl = getApiBaseUrl();
    const token = getAuthToken(getState());
    if (!token) return rejectWithValue('Missing auth token');

    try {
      const endpoint = `${baseUrl}/notifications/unread-count`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        return rejectWithValue(text || `Fetch unread count failed (${response.status})`);
      }
      const data = await response.json().catch(() => null);
      return {count: normalizeUnreadCount(data), fetchedAt: Date.now(), force};
    } catch (e) {
      return rejectWithValue('Network error while fetching unread count');
    }
  },
  {
    condition: (args, {getState}) => {
      const state: any = getState();
      const slice: NotificationsState | undefined = state?.notificationsSlices;
      if (!slice) return true;
      if (slice.unreadStatus === 'loading') return false;
      if (args?.force) return true;
      const last = slice.unreadLastFetchedAt ?? 0;
      // Throttle unread count fetches (header renders a lot).
      if (Date.now() - last < 15000) return false;
      return true;
    },
  },
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markNotificationRead',
  async (id: number, {getState, rejectWithValue}) => {
    const baseUrl = getApiBaseUrl();
    const token = getAuthToken(getState());
    if (!token) return rejectWithValue('Missing auth token');

    try {
      const endpoint = `${baseUrl}/notifications/${id}/read`;
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        return rejectWithValue(text || `Mark read failed (${response.status})`);
      }
      await response.text().catch(() => '');
      return id;
    } catch (e) {
      return rejectWithValue('Network error while marking read');
    }
  },
);

export const markAllRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_: void, {getState, rejectWithValue}) => {
    const baseUrl = getApiBaseUrl();
    const token = getAuthToken(getState());
    if (!token) return rejectWithValue('Missing auth token');

    try {
      const endpoint = `${baseUrl}/notifications/read-all`;
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        return rejectWithValue(text || `Mark all read failed (${response.status})`);
      }
      await response.text().catch(() => '');
      return true;
    } catch (e) {
      return rejectWithValue('Network error while marking all read');
    }
  },
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotificationsState: state => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchMyNotifications.pending, state => {
        state.listStatus = 'loading';
        state.listError = null;
      })
      .addCase(fetchMyNotifications.fulfilled, (state, action) => {
        state.listStatus = 'succeeded';
        state.items = Array.isArray(action.payload) ? action.payload : [];
        // Keep unreadCount in sync if we have data.
        const unread = state.items.filter(n => Number(n?.IsRead) === 0 || n?.IsRead === false).length;
        state.unreadCount = unread;
      })
      .addCase(fetchMyNotifications.rejected, (state, action) => {
        state.listStatus = 'failed';
        state.listError =
          (action.payload as string) || action.error.message || 'Failed to load notifications';
      })
      .addCase(fetchUnreadCount.pending, state => {
        state.unreadStatus = 'loading';
        state.unreadError = null;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadStatus = 'succeeded';
        state.unreadCount = Number(action.payload?.count ?? 0) || 0;
        state.unreadLastFetchedAt = action.payload?.fetchedAt ?? Date.now();
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.unreadStatus = 'failed';
        state.unreadError =
          (action.payload as string) || action.error.message || 'Failed to load unread count';
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const id = Number(action.payload);
        state.items = state.items.map(n =>
          Number(n.NotificationId) === id ? {...n, IsRead: 1} : n,
        );
        state.unreadCount = Math.max(
          0,
          state.items.filter(n => Number(n?.IsRead) === 0 || n?.IsRead === false).length,
        );
      })
      .addCase(markAllRead.fulfilled, state => {
        state.items = state.items.map(n => ({...n, IsRead: 1}));
        state.unreadCount = 0;
      });
  },
});

export const {clearNotificationsState} = notificationsSlice.actions;
export const selectNotifications = (state: RootState) => state.notificationsSlices.items;
export const selectUnreadCount = (state: RootState) => state.notificationsSlices.unreadCount;
export const selectNotificationsStatus = (state: RootState) => state.notificationsSlices.listStatus;

export default notificationsSlice.reducer;

