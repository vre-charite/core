import pageSlice from './page';
import pageSizeSlice from './pageSize';
import {combineReducers} from 'redux'

export const explorerReducer = combineReducers({
    pageSize:pageSizeSlice.reducer,
    page:pageSlice.reducer
});

export const actions = {
    page:pageSlice.actions,
    pageSize:pageSizeSlice.actions,
}