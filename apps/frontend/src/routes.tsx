import {
  createBrowserRouter,
  Navigate,
  RouteObject,
  RouterProvider,
} from 'react-router-dom';

import UserScreen from './pages/User';

const routes: RouteObject[] = [
  {
    path: 'users',
    element: <UserScreen />,
  },
  {
    path: '*',
    element: <Navigate to="/users" replace />,
  },
];

export const AppRoutes = () => {
  return <RouterProvider router={createBrowserRouter(routes)} />;
};
