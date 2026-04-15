import { useState, useEffect } from "react";

const SIDEBAR_OPEN_KEY = "sidebarOpen";

export function useSidebar() {
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    const storedValue = window.localStorage.getItem(SIDEBAR_OPEN_KEY);
    return storedValue !== null ? storedValue === "true" : false;
  });

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_OPEN_KEY, open.toString());
  }, [open]);

  const toggleSidebar = () => setOpen((prevOpen) => !prevOpen);

  return { open, toggleSidebar };
}
