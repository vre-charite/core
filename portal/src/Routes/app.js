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

import Login from '../Views/Login/Auth';
import LandingPageLayout from '../Views/ProjectLandingPage/LandingPageLayout';
import Project from '../Views/Project/Project';
import DatasetLandingPage from '../Views/DatasetLandingPage/DatasetLandingPage';
import Dataset from '../Views/Dataset/Dataset';

import ErrorPage from '../Views/ErrorPage/ErrorPage';
import General404Page from '../Views/GeneralPage/General404Page';
import SelfRegistration from '../Views/Self-Registration/Self-Registration';
import AccountAssistant from '../Views/AccountAssistant/AccountAssistant';
import PlatformManagement from '../Views/PlatformManagement/PlatformManagement';
// render whenever user is authorized
const authedRoutes = [
  {
    path: '/landing',
    component: LandingPageLayout,
    protectedType: 'isLogin',
  },
  {
    path: '/project/:datasetId',
    component: Project,
    protectedType: 'isLogin',
  },
  {
    path: '/users',
    component: PlatformManagement,
    protectedType: 'PlatformAdmin',
  },
  {
    path: '/datasets',
    component: DatasetLandingPage,
    protectedType: 'isLogin',
  },
  {
    path: '/dataset/:datasetCode',
    component: Dataset,
    protectedType: 'isLogin',
  },

  { path: '/error', component: ErrorPage, protectedType: 'isLogin' },
];
// render whenever user is unauthorized
const unAuthedRoutes = [
  {
    path: '/login',
    component: Login,
    protectedType: 'unLogin',
    exact: true,
  },
  {
    path: '/account-assistant',
    component: AccountAssistant,
    protectedType: 'unLogin',
  },

  {
    path: '/self-registration/:invitationHash',
    component: SelfRegistration,
    protectedType: 'unLogin',
  },
  {
    path: '/404',
    component: General404Page,
    exact: true,
  },
];

export { authedRoutes, unAuthedRoutes };
