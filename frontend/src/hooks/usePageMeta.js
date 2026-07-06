import { useLocation } from "react-router";

import { pageNames, PAGE_PATHS } from "../constants/pageNames";

export const usePageMeta = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const isSchedulePage = pathname === PAGE_PATHS.SCHEDULE;

  let pageName = pageNames[pathname] || "";

  if (!pageName) {
    if (pathname.startsWith(`${PAGE_PATHS.PATIENTS}/`)) {
      pageName = "Профіль пацієнта";
    }
    // ...
  }

  return { pageName, isSchedulePage };
};
