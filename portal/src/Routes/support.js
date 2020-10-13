import ContactUs from '../Views/Support/ContactUs';
import ContactConfirmation from '../Views/Support/ContactConfirmation';
import Support from '../Views/Support/SupportConent';

const routes = [
  {
    path: '/contact-confirmation',
    component: ContactConfirmation,
  },
  {
    path: '/contact-us',
    component: ContactUs,
  },
  { path: '/', component: Support },
];

export default routes;
