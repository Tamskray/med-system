import { Routes, Route } from "react-router";
import { Suspense } from "react";

import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";

import { routes } from "./routes";
import Loading from "../components/core/Loading";

const AppRouter = ({ user }) => {
  const isAuthorized = !!user;
  const permissions = user?.permissions ?? {};

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {routes.map((route) => {
          if (route.private) {
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <PrivateRoute
                    isAllowed={isAuthorized}
                    module={route.module}
                    permissions={permissions}
                  >
                    {route.element}
                  </PrivateRoute>
                }
              />
            );
          }

          if (route.restricted) {
            return (
              <Route
                key={route.path}
                path={route.path}
                element={<PublicRoute isAuthorized={isAuthorized}>{route.element}</PublicRoute>}
              />
            );
          }

          return <Route key={route.path} path={route.path} element={route.element} />;
        })}

        <Route path="*" element={<p>There's nothing here: 404!</p>} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
