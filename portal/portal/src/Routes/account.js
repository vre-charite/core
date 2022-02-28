import ForgotPassword from '../Views/AccountAssistant/ForgotPassword';
import ForgotPasswordConfirmation from '../Views/AccountAssistant/ForgotPasswordConfirmation';
import ForgotUsernameConfirmation from '../Views/AccountAssistant/ForgotUsernameConfirmation';
import ForgotUsername from '../Views/AccountAssistant/ForgotUsername';

const routes = [
  {
    path: '/forgot-username',
    component: ForgotUsername,
  },
  {
    path: '/confirmation',
    component: ForgotPasswordConfirmation,
  },
  {
    path: '/forgot-username-confirmation',
    component: ForgotUsernameConfirmation,
  },
  { path: '/', component: ForgotPassword },
];

export default routes;
