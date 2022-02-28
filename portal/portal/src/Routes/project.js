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
