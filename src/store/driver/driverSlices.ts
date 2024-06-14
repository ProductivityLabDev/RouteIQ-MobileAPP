import {createSlice} from '@reduxjs/toolkit';

const driverSlice = createSlice({
  name: 'driver',
  initialState: {
    maintenanceDetail: null,
  },
  reducers: {
    setMaintenanceDetail: (state, {payload}) => {
      state.maintenanceDetail = payload;
    },
  },
});

export const {setMaintenanceDetail} = driverSlice.actions;

export default driverSlice.reducer;
