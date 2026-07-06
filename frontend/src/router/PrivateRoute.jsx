import { Navigate, Outlet } from "react-router";

import NoAccess from "../components/core/NoAccess";

const PrivateRoute = ({ isAllowed, redirectPath = "/", module, permissions, children }) => {
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }

  if (module && permissions && permissions[module]?.read !== 1) {
    return <NoAccess />;
  }

  return children ? children : <Outlet />;
};

export default PrivateRoute;
