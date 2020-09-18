import Canvas from '../Views/Dataset/Canvas/Canvas';
import Teams from '../Views/Dataset/Teams/Teams';

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
];

export default routes;
