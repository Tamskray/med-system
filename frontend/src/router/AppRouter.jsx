import { Routes, Route } from "react-router";
import { Suspense } from "react";

import PrivateRoute from "./PrivateRoute";

import { routes } from "./routes";

const AppRouter = ({ user }) => {
  const isAuthorized = !!user;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {routes.map((route) => {
          if (route.private) {
            return (
              <Route
                key={route.path}
                path={route.path}
                element={<PrivateRoute isAllowed={isAuthorized}>{route.element}</PrivateRoute>}
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
