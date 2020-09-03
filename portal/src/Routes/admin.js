import Users from "../Views/AdminManagement/Users/UserManagement";
import Layers from "../Views/AdminManagement/Layers/Layers";

const routes = [
  {
    path: "/users",
    component: Users
  },
  {
    path: "/layers",
    component: Layers
  }
];

export default routes;
