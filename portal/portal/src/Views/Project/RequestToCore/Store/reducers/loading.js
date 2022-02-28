import { createSlice } from '@reduxjs/toolkit';
import { initStates } from '../initStates';

const loadingSlice = createSlice({
  name: 'loading',
  initialState: initStates.loading,
  reducers: {
    loadingOn: (state) => true,
    loadingOff: (state) => false,
    reset: (state) => initStates.loading,
  },
});

export default loadingSlice;
