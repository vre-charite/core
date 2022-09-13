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

import Canvas from '../Views/Project/Canvas/Canvas';
import Teams from '../Views/Project/Teams/Teams';
import Settings from '../Views/Project/Settings/Settings';
import Search from '../Views/Project/Search/Search';
import Announcement from '../Views/Project/Announcement/Announcement';
import RequestToCore from '../Views/Project/RequestToCore/RequestToCore';

const routes = [
  {
    path: '/canvas',
    component: Canvas,
    protectedType: 'projectMember', // Both admin and uploader could access
  },
  {
    path: '/teams',
    component: Teams,
    protectedType: 'projectAdmin',
  },
  {
    path: '/settings',
    component: Settings,
    protectedType: 'projectAdmin',
  },
  {
    path: '/search',
    component: Search,
    protectedType: 'projectMember',
  },
  {
    path: '/announcement',
    component: Announcement,
    protectedType: 'projectMember',
  },
  {
    path: '/requestToCore',
    component: RequestToCore,
    protectedType: 'projectCollab',
  },
];

export default routes;
