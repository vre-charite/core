import { createSlice } from '@reduxjs/toolkit';
import { initStates } from '../initStates';

const pageSizeSlice = createSlice({
  name: 'pageSize',
  initialState: initStates.pageSize,
  reducers: {
    setPageSize: (state, action) => action.payload,
    reset: (state) => initStates.pageSize,
  },
});

export default pageSizeSlice;
