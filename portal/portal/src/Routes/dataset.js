import DatasetHome from '../Views/Dataset/DatasetHome/DatasetHome';
import DatasetData from '../Views/Dataset/DatasetData/DatasetData';
import DatasetSchema from '../Views/Dataset/DatasetSchema/DatasetSchema';
import DatasetActivity from '../Views/Dataset/DatasetActivity/DatasetActivity';

export const datasetRoutes = [
  {
    path: '/home',
    component: DatasetHome,
    protectedType: 'isLogin', // Both admin and uploader could access
  },
  {
    path: '/data',
    component: DatasetData,
    protectedType: 'isLogin', // Both admin and uploader could access
  },
  {
    path: '/schema',
    component: DatasetSchema,
    protectedType: 'isLogin', // Both admin and uploader could access
  },
  {
    path: '/activity',
    component: DatasetActivity,
    protectedType: 'isLogin', // Both admin and uploader could access
  },
];


