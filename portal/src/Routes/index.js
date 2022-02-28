import { authedRoutes, unAuthedRoutes } from './app';
import projectRoutes from './project';
import { datasetRoutes } from './dataset';
import accountAssistant from './account';
import errorPageRoutes from './errorPage';
import { createBrowserHistory } from 'history';
import { PORTAL_PREFIX } from '../config';

const basename = PORTAL_PREFIX;
const history = createBrowserHistory({ basename });
export {
  authedRoutes,
  unAuthedRoutes,
  projectRoutes,
  accountAssistant,
  errorPageRoutes,
  history,
  basename,
  datasetRoutes,
};
