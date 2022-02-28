import { createSlice } from '@reduxjs/toolkit';
import { initStates } from '../initStates';
import _ from 'lodash';

const routeSlice = createSlice({
  name: 'route',
  initialState: initStates.route,
  reducers: {
    setRoute: (state, action) => _.cloneDeep(action.payload),
    reset: (state) => _.cloneDeep(initStates.route),
  },
});

export default routeSlice;
