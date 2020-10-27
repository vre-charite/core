import ForgotPassword from '../Views/AccountAssistant/ForgotPassword';
import ForgotPasswordConfirmation from '../Views/AccountAssistant/ForgotPasswordConfirmation';
import ForgotUsernameConfirmation from '../Views/AccountAssistant/ForgotUsernameConfirmation';
import ForgotUsername from '../Views/AccountAssistant/ForgotUsername';
import ResetPassword from '../Views/AccountAssistant/ResetPassword';
import ResetPasswordConfirmation from '../Views/AccountAssistant/ResetPasswordConfirmation';

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
  {
    path: '/reset-password',
    component: ResetPassword,
  },
  {
    path: '/reset-password-confirmation',
    component: ResetPasswordConfirmation,
  },
  { path: '/', component: ForgotPassword },
];

export default routes;
