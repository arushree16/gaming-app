import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    fetchAnalyticsStart: (state) => {
      state.loading = true;
    },
    fetchAnalyticsSuccess: (state, action) => {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchAnalyticsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchAnalyticsStart, fetchAnalyticsSuccess, fetchAnalyticsFailure } = analyticsSlice.actions;
export default analyticsSlice.reducer; 