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
