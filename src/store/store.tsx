import {configureStore, combineReducers} from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userSlices from './user/userSlices';
import driverSlices from './driver/driverSlices';
import notificationsSlices from './notifications/notificationsSlice';
import chatSlices from './chat/chatSlice';
import retailerSlices from './retailer/retailerSlice';

const reducers = combineReducers({
  userSlices,
  driverSlices,
  notificationsSlices,
  chatSlices,
  retailerSlices,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  // Persist slice keys must match combineReducers keys, and the option is "whitelist" (lowercase).
  // Persist auth + driver + notifications so list/unread count survive app reload.
  whitelist: ['userSlices', 'driverSlices', 'notificationsSlices', 'retailerSlices'],
  //   blackList: ['poSlice', 'common'],
};

const persistedReducers = persistReducer(persistConfig, reducers);

export const store = configureStore({
  reducer: persistedReducers,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    }),
});

export const persister = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
