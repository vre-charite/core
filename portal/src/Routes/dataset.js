import Canvas from '../Views/Dataset/Canvas/Canvas';
import Teams from '../Views/Dataset/Teams/Teams';
import Settings from '../Views/Dataset/Settings/Settings';
import Announcement from '../Views/Dataset/Announcement/Announcement'

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
    path:'/announcement',
    component:Announcement,
    protectedType:'projectMember',
  }
];

export default routes;
