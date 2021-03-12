import { authedRoutes, unAuthedRoutes } from './app';
import datasetRoutes from './dataset';
import contactUsRoutes from './support';
import accountAssistant from './account';
import errorPageRoutes from './errorPage';
import { createBrowserHistory } from 'history';
const basename = '/vre';
const history = createBrowserHistory({ basename });
export {
  authedRoutes,
  unAuthedRoutes,
  datasetRoutes,
  contactUsRoutes,
  accountAssistant,
  errorPageRoutes,
  history,
  basename,
};
