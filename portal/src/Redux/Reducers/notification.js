// Copyright 2022 Indoc Research
// 
// Licensed under the EUPL, Version 1.2 or – as soon they
// will be approved by the European Commission - subsequent
// versions of the EUPL (the "Licence");
// You may not use this work except in compliance with the
// Licence.
// You may obtain a copy of the Licence at:
// 
// https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
// 
// Unless required by applicable law or agreed to in
// writing, software distributed under the Licence is
// distributed on an "AS IS" basis,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
// express or implied.
// See the Licence for the specific language governing
// permissions and limitations under the Licence.
// 

import { NOTIFICATIONS } from '../actionTypes';

const initData = {
  activeNotification: null,
  createNewNotificationStatus: false,
  userNotifications: [],
  notificationList: [],
  updateNotificationTimes: 0,
  edit: false,
};

const notificationReducer = (state = initData, action) => {
  switch (action.type) {
    case NOTIFICATIONS.SET_ACTIVE_NOTIFICATION:
      return { ...state, activeNotification: action.payload };
    case NOTIFICATIONS.SET_CREATE_NEW_NOTIFICATION_LIST_ITEM__STATUS:
      return { ...state, createNewNotificationStatus: action.payload };
    case NOTIFICATIONS.SET_USER_NOTIFICATIONS:
      return { ...state, userNotifications: action.payload };
    case NOTIFICATIONS.SET_NOTIFICATION_LIST:
      return { ...state, notificationList: action.payload };
    case NOTIFICATIONS.SET_UPDATE_NOTIFICATION_TIMES:
      return { ...state, updateNotificationTimes: action.payload };
    case NOTIFICATIONS.SET_EDIT_NOTIFICATION:
      return { ...state, edit: action.payload };
    default:
      return state;
  }
};

export default notificationReducer;
