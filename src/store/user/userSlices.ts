import {createSlice} from '@reduxjs/toolkit';
import {childDropDown} from '../../utils/DummyData';

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
    studentAbsentModal: false,
    selectedChild: {},
    forgotType: '',
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
});

export const {
  saveToken,
  setLogout,
  setRole,
  setDriverHomeStatus,
  setSelectedUserChatData,
  setShowStartMileAgeSheet,
  setMapViewRouteBackOn,
  setStudentAbsentModal,
  setSelectedChild,
  setForgotType,
} = userSlice.actions;

export default userSlice.reducer;
