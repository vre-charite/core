import Login from '../Views/Login/Auth';
import Uploader from '../Views/Uploader/Uploader';
import Dataset from '../Views/Dataset/Dataset';
import Support from '../Views/Support/Support';
import ErrorPage from '../Views/ErrorPage/ErrorPage';
import SelfRegistration from '../Views/Self-Registration/Self-Registration';
import AccountAssistant from '../Views/AccountAssistant/AccountAssistant';
import UserManagement from '../Views/UsersManagement';

const authedRoutes = [
  {
    path: '/landing',
    component: Uploader,
    protectedType: 'isLogin',
  },
  {
    path: '/project/:datasetId',
    component: Dataset,
    protectedType: 'isLogin',
  },
  {
    path: '/support',
    component: Support,
    protectedType: 'isLogin',
  },
  {
    path: '/users',
    component: UserManagement,
    protectedType: 'isLogin',
  },


  /*   {
    path: "/admin",
    component: AdminManagement,
    protectedType: "isLogin",
  }, */
  { path: '/error', component: ErrorPage, protectedType: 'isLogin' },
];

const unAuthedRoutes = [
  {
    path: '/',
    component: Login,
    protectedType: 'unLogin',
    exact: true,
  },
  /*   {
    path: "/register",
    component: Register,
    protectedType: "unLogin",
  },*/
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
];

export { authedRoutes, unAuthedRoutes };
