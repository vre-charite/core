import { createSlice } from '@reduxjs/toolkit';
import { initStates } from '../initStates';

const totalSlice = createSlice({
  name: 'total',
  initialState: initStates.total,
  reducers: {
    setTotal: (state, action) => action.payload,
  },
});

export default totalSlice;
