import { Navigate } from "react-router";

const PublicRoute = ({ isAuthorized, redirectPath = "/schedule", children }) => {
  if (isAuthorized) {
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default PublicRoute;
