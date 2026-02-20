import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {getApiBaseUrl} from '../../utils/apiConfig';
import type {RootState} from '../store';
import type {ChatContact, ChatConversation, ChatMessage} from './chatTypes';
import {toParticipantType} from './chatTypes';

const getAuthToken = (state: any): string | null => state?.userSlices?.token ?? null;

// ——— Contacts (query: type = DRIVER | GUARDIAN | SCHOOL | VENDOR) ———
export const fetchChatContacts = createAsyncThunk(
  'chat/fetchContacts',
  async (
    params?: { type?: string },
    {getState, rejectWithValue},
  ) => {
    const base = getApiBaseUrl();
    const token = getAuthToken(getState());
    if (!token) return rejectWithValue('Missing auth token');
    try {
      // Build query string manually (URLSearchParams not fully supported in RN)
      const queryParams = [];
      if (params?.type) queryParams.push(`type=${encodeURIComponent(params.type)}`);
      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const url = `${base}/chat/contacts${queryString}`;

      console.log('[fetchChatContacts] URL:', url);
      console.log('[fetchChatContacts] Params:', params);

      const res = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });

      console.log('[fetchChatContacts] Response status:', res.status);

      if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        console.log('[fetchChatContacts] Error response:', errorText);
        return rejectWithValue(errorText);
      }

      const data = await res.json().catch(() => null);
      console.log('[fetchChatContacts] Response data:', data);

      const list = data?.contacts ?? data?.data ?? (Array.isArray(data) ? data : []);
      console.log('[fetchChatContacts] Parsed contacts list:', list);

      // Add participantType to each contact based on the query type
      const contactsWithType = list.map((contact: any) => ({
        ...contact,
        participantType: params?.type ?? contact.participantType,
      }));

      return contactsWithType as ChatContact[];
    } catch (e) {
      console.log('[fetchChatContacts] Exception:', e);
      return rejectWithValue(e instanceof Error ? e.message : 'Network error');
    }
  },
);

// ——— Conversations list (query: type optional) ———
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (
    params?: { type?: string },
    {getState, rejectWithValue},
  ) => {
    const base = getApiBaseUrl();
    const token = getAuthToken(getState());
    if (!token) return rejectWithValue('Missing auth token');
    try {
      // Build query string manually (URLSearchParams not fully supported in RN)
      const queryParams = [];
      if (params?.type) queryParams.push(`type=${encodeURIComponent(params.type)}`);
      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const url = `${base}/chat/conversations${queryString}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (!res.ok) return rejectWithValue(await res.text().catch(() => ''));
      const data = await res.json().catch(() => null);
      const list = data?.conversations ?? data?.data ?? (Array.isArray(data) ? data : []);
      return list as ChatConversation[];
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : 'Network error');
    }
  },
);

// ——— Create conversation ———
// Direct: { type: "DIRECT", participantId, participantType }
// Group: { type: "GROUP", name, avatar?, participants: [{ id, type }] }
export const createConversation = createAsyncThunk(
  'chat/createConversation',
  async (
    body: {
      type?: 'DIRECT' | 'GROUP' | 'direct' | 'group';
      participantId?: string | number;
      participantType?: string;
      name?: string;
      avatar?: string;
      participantIds?: (string | number)[];
      participantTypes?: string[];
      participants?: { id: string | number; type: string }[];
    },
    {getState, rejectWithValue},
  ) => {
    const base = getApiBaseUrl();
    const token = getAuthToken(getState());
    if (!token) return rejectWithValue('Missing auth token');
    try {
      const typeUpper = (body.type || 'DIRECT').toString().toUpperCase();
      let payload: any;

      if (typeUpper === 'DIRECT' && (body.participantId != null || body.participantType != null)) {
        payload = {
          type: 'DIRECT',
          participantId: Number(body.participantId),
          participantType: body.participantType ? toParticipantType(body.participantType) : 'GUARDIAN',
        };
      } else if (typeUpper === 'GROUP') {
        const participants =
          body.participants ||
          (body.participantIds && body.participantTypes
            ? body.participantIds.map((id, i) => ({
                id: Number(id),
                type: toParticipantType(body.participantTypes![i] || 'GUARDIAN'),
              }))
            : []);
        payload = {
          type: 'GROUP',
          name: body.name || 'New Group',
          participants,
        };
        if (body.avatar != null) payload.avatar = body.avatar;
      } else {
        return rejectWithValue('Invalid create conversation body');
      }

      const res = await fetch(`${base}/chat/conversations`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return rejectWithValue(await res.text().catch(() => ''));
      const data = await res.json().catch(() => null);
      const conv = data?.data ?? data?.conversation ?? data;
      return conv as ChatConversation;
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : 'Network error');
    }
  },
);

// ——— Messages (query: page default 1, limit default 50) ———
export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (
    {
      conversationId,
      page = 1,
      limit = 50,
    }: { conversationId: string | number; page?: number; limit?: number },
    {getState, rejectWithValue},
  ) => {
    const base = getApiBaseUrl();
    const token = getAuthToken(getState());
    if (!token) return rejectWithValue('Missing auth token');
    try {
      // Build query string manually (URLSearchParams not fully supported in RN)
      const queryString = `?page=${page}&limit=${limit}`;
      const res = await fetch(`${base}/chat/conversations/${conversationId}/messages${queryString}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (!res.ok) return rejectWithValue(await res.text().catch(() => ''));
      const data = await res.json().catch(() => null);
      const list = data?.messages ?? data?.data ?? (Array.isArray(data) ? data : []);
      const hasMore = data?.hasMore ?? false;
      const total = data?.total;
      return {
        conversationId: String(conversationId),
        messages: list as ChatMessage[],
        hasMore,
        total,
      };
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : 'Network error');
    }
  },
);

// ——— Send message (text only) ———
export const sendChatMessage = createAsyncThunk(
  'chat/sendMessage',
  async (
    payload: {
      conversationId: string | number;
      text?: string;
      attachmentUrl?: string;
      attachmentType?: string;
    },
    {getState, rejectWithValue},
  ) => {
    const base = getApiBaseUrl();
    const token = getAuthToken(getState());
    if (!token) return rejectWithValue('Missing auth token');
    try {
      // Backend expects ONLY camelCase fields
      const body: any = {
        conversationId: payload.conversationId,
      };

      // Ensure content is always a non-empty string if text is provided
      if (payload.text && payload.text.trim()) {
        body.content = payload.text.trim();
      } else if (!payload.attachmentUrl) {
        // If no text and no attachment, return error
        return rejectWithValue('Message content cannot be empty');
      }

      if (payload.attachmentUrl) {
        body.attachmentUrl = payload.attachmentUrl;
      }
      if (payload.attachmentType) {
        body.attachmentType = payload.attachmentType;
      }

      const res = await fetch(`${base}/chat/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        return rejectWithValue(errorText);
      }
      const data = await res.json().catch(() => null);
      const msg = data?.data ?? data?.message ?? data;
      return msg as ChatMessage;
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : 'Network error');
    }
  },
);

// ——— Upload file and send message (image/document) ———
export const uploadAndSendFile = createAsyncThunk(
  'chat/uploadAndSendFile',
  async (
    payload: {
      conversationId: string | number;
      file: {
        uri: string;
        type: string;
        name: string;
      };
      content?: string; // optional caption
    },
    {getState, rejectWithValue},
  ) => {
    const base = getApiBaseUrl();
    const token = getAuthToken(getState());
    if (!token) return rejectWithValue('Missing auth token');
    try {
      const formData = new FormData();
      formData.append('conversationId', String(payload.conversationId));
      if (payload.content) formData.append('content', payload.content);

      // Append file - React Native FormData
      formData.append('file', {
        uri: payload.file.uri,
        type: payload.file.type,
        name: payload.file.name,
      } as any);

      const res = await fetch(`${base}/chat/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          // Content-Type: multipart/form-data auto-set by fetch
        },
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        return rejectWithValue(errorText);
      }
      const data = await res.json().catch(() => null);
      const msg = data?.data ?? data?.message ?? data;
      return msg as ChatMessage;
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : 'Network error');
    }
  },
);

// ——— Mark read ———
export const markConversationRead = createAsyncThunk(
  'chat/markRead',
  async (conversationId: string | number, {getState, rejectWithValue}) => {
    const base = getApiBaseUrl();
    const token = getAuthToken(getState());
    if (!token) return rejectWithValue('Missing auth token');
    try {
      const res = await fetch(`${base}/chat/conversations/${conversationId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (!res.ok) return rejectWithValue(await res.text().catch(() => ''));
      return conversationId;
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : 'Network error');
    }
  },
);

// ——— Add participant (group) ———
export const addParticipant = createAsyncThunk(
  'chat/addParticipant',
  async (
    {conversationId, participantId, participantType}: { conversationId: string | number; participantId: string | number; participantType: string },
    {getState, rejectWithValue},
  ) => {
    const base = getApiBaseUrl();
    const token = getAuthToken(getState());
    if (!token) return rejectWithValue('Missing auth token');
    try {
      const res = await fetch(`${base}/chat/conversations/${conversationId}/participants`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ participantId, participantType }),
      });
      if (!res.ok) return rejectWithValue(await res.text().catch(() => ''));
      const data = await res.json().catch(() => null);
      return data?.data ?? data ?? { conversationId, participantId, participantType };
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : 'Network error');
    }
  },
);

// ——— Remove participant ———
export const removeParticipant = createAsyncThunk(
  'chat/removeParticipant',
  async (
    {conversationId, participantId, participantType}: { conversationId: string | number; participantId: string | number; participantType: string },
    {getState, rejectWithValue},
  ) => {
    const base = getApiBaseUrl();
    const token = getAuthToken(getState());
    if (!token) return rejectWithValue('Missing auth token');
    try {
      const res = await fetch(
        `${base}/chat/conversations/${conversationId}/participants/${participantId}/${participantType}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) return rejectWithValue(await res.text().catch(() => ''));
      return { conversationId, participantId, participantType };
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : 'Network error');
    }
  },
);

// ——— Update group (name / avatar) ———
export const updateConversation = createAsyncThunk(
  'chat/updateConversation',
  async (
    {conversationId, name, avatar}: { conversationId: string | number; name?: string; avatar?: string },
    {getState, rejectWithValue},
  ) => {
    const base = getApiBaseUrl();
    const token = getAuthToken(getState());
    if (!token) return rejectWithValue('Missing auth token');
    try {
      const body: { name?: string; avatar?: string } = {};
      if (name !== undefined) body.name = name;
      if (avatar !== undefined) body.avatar = avatar;
      const res = await fetch(`${base}/chat/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) return rejectWithValue(await res.text().catch(() => ''));
      const data = await res.json().catch(() => null);
      const conv = data?.data ?? data?.conversation ?? data;
      return conv as ChatConversation;
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : 'Network error');
    }
  },
);

// ——— Monitoring (Vendor / School only; 403 if Driver/Parent) ———
export const fetchMonitoredConversations = createAsyncThunk(
  'chat/fetchMonitoredConversations',
  async (
    params?: { sourceType?: string; targetType?: string; page?: number; limit?: number },
    {getState, rejectWithValue},
  ) => {
    const base = getApiBaseUrl();
    const token = getAuthToken(getState());
    if (!token) return rejectWithValue('Missing auth token');
    try {
      // Build query string manually (URLSearchParams not fully supported in RN)
      const queryParams = [];
      if (params?.page != null) queryParams.push(`page=${params.page}`);
      if (params?.limit != null) queryParams.push(`limit=${params.limit}`);
      if (params?.sourceType) queryParams.push(`sourceType=${encodeURIComponent(params.sourceType)}`);
      if (params?.targetType) queryParams.push(`targetType=${encodeURIComponent(params.targetType)}`);
      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const url = `${base}/chat/monitoring/conversations${queryString}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (!res.ok) return rejectWithValue(await res.text().catch(() => ''));
      const data = await res.json().catch(() => null);
      const list = data?.conversations ?? data?.data ?? (Array.isArray(data) ? data : []);
      return list as ChatConversation[];
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : 'Network error');
    }
  },
);

export const fetchMonitoredMessages = createAsyncThunk(
  'chat/fetchMonitoredMessages',
  async (
    {
      conversationId,
      page = 1,
      limit = 50,
    }: { conversationId: string | number; page?: number; limit?: number },
    {getState, rejectWithValue},
  ) => {
    const base = getApiBaseUrl();
    const token = getAuthToken(getState());
    if (!token) return rejectWithValue('Missing auth token');
    try {
      // Build query string manually (URLSearchParams not fully supported in RN)
      const queryString = `?page=${page}&limit=${limit}`;
      const res = await fetch(
        `${base}/chat/monitoring/conversations/${conversationId}/messages${queryString}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        },
      );
      if (!res.ok) return rejectWithValue(await res.text().catch(() => ''));
      const data = await res.json().catch(() => null);
      const list = data?.messages ?? data?.data ?? (Array.isArray(data) ? data : []);
      return {
        conversationId: String(conversationId),
        messages: list as ChatMessage[],
        hasMore: data?.hasMore ?? false,
        total: data?.total,
      };
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : 'Network error');
    }
  },
);

// ——— State ———
type ChatState = {
  contacts: ChatContact[];
  contactsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  contactsError: string | null;
  conversations: ChatConversation[];
  conversationsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  conversationsError: string | null;
  selectedConversation: ChatConversation | null;
  messagesByConversation: Record<string, ChatMessage[]>;
  messagesStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  messagesError: string | null;
  sendStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  sendError: string | null;
  uploadStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  uploadError: string | null;
  // Typing indicators: { conversationId: { userId: userType } }
  typingUsers: Record<string, Record<string, string>>;
};

const initialState: ChatState = {
  contacts: [],
  contactsStatus: 'idle',
  contactsError: null,
  conversations: [],
  conversationsStatus: 'idle',
  conversationsError: null,
  selectedConversation: null,
  messagesByConversation: {},
  messagesStatus: 'idle',
  messagesError: null,
  sendStatus: 'idle',
  sendError: null,
  uploadStatus: 'idle',
  uploadError: null,
  typingUsers: {},
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setSelectedConversation: (state, action: { payload: ChatConversation | null }) => {
      state.selectedConversation = action.payload;
    },
    clearMessagesForConversation: (state, action: { payload: string | number }) => {
      delete state.messagesByConversation[String(action.payload)];
    },
    clearContacts: (state) => {
      state.contacts = [];
      state.contactsStatus = 'idle';
      state.contactsError = null;
    },
    clearChatState: () => initialState,
    // WebSocket: add new message from socket event
    addSocketMessage: (state, action: { payload: ChatMessage }) => {
      const msg = action.payload;
      if (msg?.conversationId == null) return;
      const key = String(msg.conversationId ?? (msg as any).conversation_id);
      const list = state.messagesByConversation[key] ?? [];
      if (!list.some((m: ChatMessage) => String(m.id) === String(msg.id))) {
        state.messagesByConversation[key] = [...list, msg];
      }
    },
    // Typing indicators
    setUserTyping: (state, action: { payload: { conversationId: number; userId: number; userType: string } }) => {
      const { conversationId, userId, userType } = action.payload;
      const key = String(conversationId);
      if (!state.typingUsers[key]) state.typingUsers[key] = {};
      state.typingUsers[key][String(userId)] = userType;
    },
    setUserStopTyping: (state, action: { payload: { conversationId: number; userId?: number } }) => {
      const { conversationId, userId } = action.payload;
      const key = String(conversationId);
      if (userId) {
        delete state.typingUsers[key]?.[String(userId)];
      } else {
        delete state.typingUsers[key];
      }
    },
  },
  extraReducers: builder => {
    // Contacts
    builder
      .addCase(fetchChatContacts.pending, state => {
        state.contactsStatus = 'loading';
        state.contactsError = null;
      })
      .addCase(fetchChatContacts.fulfilled, (state, action) => {
        state.contactsStatus = 'succeeded';
        // Merge new contacts with existing ones (avoid duplicates by ID)
        const newContacts = action.payload ?? [];
        const existingIds = new Set(state.contacts.map(c => c.id));
        const uniqueNewContacts = newContacts.filter(c => !existingIds.has(c.id));
        state.contacts = [...state.contacts, ...uniqueNewContacts];
        state.contactsError = null;
      })
      .addCase(fetchChatContacts.rejected, (state, action) => {
        state.contactsStatus = 'failed';
        state.contactsError = (action.payload as string) ?? action.error.message ?? null;
      });

    // Conversations
    builder
      .addCase(fetchConversations.pending, state => {
        state.conversationsStatus = 'loading';
        state.conversationsError = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversationsStatus = 'succeeded';
        state.conversations = action.payload ?? [];
        state.conversationsError = null;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.conversationsStatus = 'failed';
        state.conversationsError = (action.payload as string) ?? action.error.message ?? null;
      });

    // Create conversation
    builder.addCase(createConversation.fulfilled, (state, action) => {
      const c = action.payload;
      if (c?.id != null && !state.conversations.some(x => String(x.id) === String(c.id))) {
        state.conversations = [c, ...state.conversations];
      }
    });

    // Messages
    builder
      .addCase(fetchMessages.pending, state => {
        state.messagesStatus = 'loading';
        state.messagesError = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesStatus = 'succeeded';
        state.messagesError = null;
        const { conversationId, messages } = action.payload;
        state.messagesByConversation[conversationId] = messages ?? [];
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.messagesStatus = 'failed';
        state.messagesError = (action.payload as string) ?? action.error.message ?? null;
      });

    // Send message
    builder
      .addCase(sendChatMessage.pending, state => {
        state.sendStatus = 'loading';
        state.sendError = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.sendStatus = 'succeeded';
        state.sendError = null;
        const msg = action.payload;
        if (msg?.conversationId != null) {
          const key = String(msg.conversationId ?? (msg as any).conversation_id);
          const list = state.messagesByConversation[key] ?? [];
          const messageToAdd = { ...msg, _isFromMe: true };
          if (!list.some((m: ChatMessage) => String(m.id) === String(msg.id))) {
            state.messagesByConversation[key] = [...list, messageToAdd];
          }
        }
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.sendStatus = 'failed';
        state.sendError = (action.payload as string) ?? action.error.message ?? null;
      });

    // Upload file
    builder
      .addCase(uploadAndSendFile.pending, state => {
        state.uploadStatus = 'loading';
        state.uploadError = null;
      })
      .addCase(uploadAndSendFile.fulfilled, (state, action) => {
        state.uploadStatus = 'succeeded';
        state.uploadError = null;
        const msg = action.payload;
        if (msg?.conversationId != null) {
          const key = String(msg.conversationId ?? (msg as any).conversation_id);
          const list = state.messagesByConversation[key] ?? [];
          const messageToAdd = { ...msg, _isFromMe: true };
          if (!list.some((m: ChatMessage) => String(m.id) === String(msg.id))) {
            state.messagesByConversation[key] = [...list, messageToAdd];
          }
        }
      })
      .addCase(uploadAndSendFile.rejected, (state, action) => {
        state.uploadStatus = 'failed';
        state.uploadError = (action.payload as string) ?? action.error.message ?? null;
      });

    // Mark read — optional: update local unreadCount
    builder.addCase(markConversationRead.fulfilled, (state, action) => {
      const id = String(action.payload);
      const conv = state.conversations.find(c => String(c.id) === id);
      if (conv) conv.unreadCount = 0;
    });

    // Update conversation
    builder.addCase(updateConversation.fulfilled, (state, action) => {
      const c = action.payload;
      if (c?.id == null) return;
      const idx = state.conversations.findIndex(x => String(x.id) === String(c.id));
      if (idx >= 0) state.conversations[idx] = { ...state.conversations[idx], ...c };
    });
  },
});

export const {
  setSelectedConversation,
  clearMessagesForConversation,
  clearContacts,
  clearChatState,
  addSocketMessage,
  setUserTyping,
  setUserStopTyping,
} = chatSlice.actions;

export const selectSelectedConversation = (s: RootState) => s.chatSlices?.selectedConversation ?? null;
export const selectChatContacts = (s: RootState) => s.chatSlices?.contacts ?? [];
export const selectChatContactsStatus = (s: RootState) => s.chatSlices?.contactsStatus ?? 'idle';
export const selectConversations = (s: RootState) => s.chatSlices?.conversations ?? [];
export const selectConversationsStatus = (s: RootState) => s.chatSlices?.conversationsStatus ?? 'idle';
export const selectMessages = (conversationId: string | number) => (s: RootState) =>
  s.chatSlices?.messagesByConversation?.[String(conversationId)] ?? [];
export const selectMessagesStatus = (s: RootState) => s.chatSlices?.messagesStatus ?? 'idle';
export const selectSendStatus = (s: RootState) => s.chatSlices?.sendStatus ?? 'idle';
export const selectUploadStatus = (s: RootState) => s.chatSlices?.uploadStatus ?? 'idle';
export const selectTypingUsers = (conversationId: string | number) => (s: RootState) =>
  s.chatSlices?.typingUsers?.[String(conversationId)] ?? {};

export default chatSlice.reducer;
