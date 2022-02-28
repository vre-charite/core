import { SHOW_SERVICE_REQUEST_RED_DOT } from '../actionTypes';

const initData = {
    showRedDot: false
}

const serviceRequestRedDot = (state = initData, action) => {
    switch (action.type) {
        case SHOW_SERVICE_REQUEST_RED_DOT:
            return {
                ...state,
                showRedDot: action.payload
            }
        default: {
            return state;
        }
    }
}

export default serviceRequestRedDot;