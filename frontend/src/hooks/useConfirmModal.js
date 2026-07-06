import { useState, useCallback } from "react";

export const useConfirmModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [target, setTarget] = useState(null);

  const open = useCallback((item = null) => {
    setTarget(item);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setTarget(null);
  }, []);

  return {
    isOpen,
    target,
    open,
    close,
  };
};
