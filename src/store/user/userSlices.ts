import {createSlice} from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'users',
  initialState: {
    token: null,
    logout: false,
    role: '',
    driverHomeStatus: false,
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
  },
});

export const {saveToken, setLogout, setRole, setDriverHomeStatus} = userSlice.actions;

export default userSlice.reducer;
