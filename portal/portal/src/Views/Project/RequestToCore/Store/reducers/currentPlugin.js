import { createSlice } from '@reduxjs/toolkit';
import { initStates } from '../initStates';

const currentPluginSlice = createSlice({
  name: 'currentPlugin',
  initialState: initStates.currentPlugin,
  reducers: {
    setCurrentPlugin: (state, action) => action.payload,
    reset: (state) => initStates.currentPlugin,
  },
});

export default currentPluginSlice;
