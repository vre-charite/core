import { authedRoutes, unAuthedRoutes } from './app';
import datasetRoutes from './dataset';
import contactUsRoutes from './support';
import accountAssistant from './account';
import errorPageRoutes from './errorPage';
import { createBrowserHistory } from 'history';
const history = createBrowserHistory({basename:'/vre'});
export {
  authedRoutes,
  unAuthedRoutes,
  datasetRoutes,
  contactUsRoutes,
  accountAssistant,
  errorPageRoutes,
  history,
};
