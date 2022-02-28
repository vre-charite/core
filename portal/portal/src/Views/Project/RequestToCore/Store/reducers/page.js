import { createSlice } from '@reduxjs/toolkit';
import { initStates } from '../initStates';

const pageSlice = createSlice({
  name: 'page',
  initialState: initStates.pageSize,
  reducers: {
    setPage: (state, action) => action.payload,
    reset: (state) => initStates.pageSize,
  },
});

export default pageSlice;
