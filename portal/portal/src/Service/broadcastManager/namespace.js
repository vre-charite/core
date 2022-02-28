const broadCast = {
    "USER_CLICK_LOGIN": "USER_CLICK_LOGIN",
    "CLICK_HEADER_LOGOUT": "CLICK_HEADER_LOGOUT",
    'CLICK_REFRESH_MODAL': 'CLICK_REFRESH_MODAL',
    "AUTO_REFRESH": 'AUTO_REFRESH',
    "REFRESH_MODAL_LOGOUT": "REFRESH_MODAL_LOGOUT",
    "ONACTION": "ONACTION",
    "LOGOUT": "LOGOUT"
}

Object.entries(broadCast).forEach(([key, value]) => {
    broadCast[key] = "BROADCAST_" + value;
});

export { broadCast };