import {createSlice} from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'users',
  initialState: {
    token: null,
    logout: false,
    role: '',
    driverHomeStatus: false,
    selectedUserChatData: {},
    showStartMileAgeSheet: false,
    mapViewRouteBackOn: 'DriverHomeScreen',
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
    setSelectedUserChatData: (state, {payload}) => {
      state.selectedUserChatData = payload;
    },
    setShowStartMileAgeSheet: (state, {payload}) => {
      state.showStartMileAgeSheet = payload;
    },
    setMapViewRouteBackOn: (state, {payload}) => {
      state.mapViewRouteBackOn = payload;
    },
  },
});

export const {
  saveToken,
  setLogout,
  setRole,
  setDriverHomeStatus,
  setSelectedUserChatData,
  setShowStartMileAgeSheet,
  setMapViewRouteBackOn,
} = userSlice.actions;

export default userSlice.reducer;
