import {createSlice} from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'users',
  initialState: {
    token: null,
  },
  reducers: {
    saveToken: (state, {payload}) => {
      state.token = payload;
    },
  },
});

export const {saveToken} = userSlice.actions;

export default userSlice.reducer;
