import { authedRoutes, unAuthedRoutes } from './app';
import datasetRoutes from './dataset';
import accountAssistant from './account';
import errorPageRoutes from './errorPage';
import { createBrowserHistory } from 'history';
const basename = '/vre';
const history = createBrowserHistory({ basename });
export {
  authedRoutes,
  unAuthedRoutes,
  datasetRoutes,
  accountAssistant,
  errorPageRoutes,
  history,
  basename,
};
