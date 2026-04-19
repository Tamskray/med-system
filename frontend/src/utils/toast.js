import toast from "react-hot-toast";

export const toastConfig = {
  duration: 4000,
  position: "top-right",
  style: {
    background: "#fff",
    color: "#333",
    fontFamily: "'Roboto', 'Inter', sans-serif",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
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
