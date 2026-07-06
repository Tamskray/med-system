import { useSelector } from "react-redux";

import { userSelector } from "../redux/selectors/authSelector";

export function useAccess(module) {
  const user = useSelector(userSelector);
  const perms = user?.permissions?.[module] ?? {};

  const isSuperAdmin = user?.is_super_admin === true;

  return {
    isSuperAdmin,
    create: isSuperAdmin || perms.create === 1,
    read: isSuperAdmin || perms.read === 1,
    update: isSuperAdmin || perms.update === 1,
    delete: isSuperAdmin || perms.delete === 1,
  };
}
