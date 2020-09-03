import { authedRoutes, unAuthedRoutes } from './app';
import datasetRoutes from './dataset';
import errorPageRoutes from './errorPage';
import { createBrowserHistory } from 'history';
const history = createBrowserHistory({ basename: '/vre' });
export {
  authedRoutes,
  unAuthedRoutes,
  datasetRoutes,
  errorPageRoutes,
  history,
};
