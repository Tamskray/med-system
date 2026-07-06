import toast from "react-hot-toast";

import { theme } from "../theme";

export const toastConfig = {
  duration: 4000,
  position: "top-right",
  style: {
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    fontFamily: "'Roboto', 'Inter', sans-serif",
    boxShadow: `0 4px 12px ${theme.palette.action.disabledBackground}`,
  },
};

export const showErrorToast = (message) => {
  toast.error(message, {
    ...toastConfig,
  });
};

export const showSuccessToast = (message) => {
  toast.success(message, {
    ...toastConfig,
  });
};

export const showLoadingToast = (message) => {
  return toast.loading(message, {
    ...toastConfig,
  });
};
