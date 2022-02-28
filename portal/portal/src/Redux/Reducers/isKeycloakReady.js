import { SET_IS_KEYCLOAK_READY } from "../actionTypes";


/**
 * the user logout creator may dispatch a action with an empty {}
 */
const init = false;
function isKeycloakReady(state = init, action) {
    let { type, payload } = action;
    switch (type) {
        case SET_IS_KEYCLOAK_READY: {
            if (typeof payload !== 'boolean') {
                return state;
            }
            return payload;
        }
        default: {
            return state;
        }
    }
}

export default isKeycloakReady;
