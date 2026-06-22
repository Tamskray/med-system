import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "../Modal";
import { BUTTON_MODES } from "../Button";

function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  itemName,
  itemLabel = "item",
  title = "Підтвердіть видалення",
  submitText = "Видалити",
  cancelText = "Скасувати",
  customWarningText,
  isLoading = false,
}) {
  const warningText = customWarningText || (
    <>
      Ви впевнені, що хочете видалити <strong>{itemName || `цей ${itemLabel}`}</strong>?
    </>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      onSubmit={onConfirm}
      submitText={submitText}
      cancelText={cancelText}
      submitMode={BUTTON_MODES.ERROR_FILLED}
      submitDisabled={isLoading}
    >
      <Box sx={{ mt: 1 }}>
        <Typography>{warningText}</Typography>
      </Box>
    </Modal>
  );
}

export default DeleteConfirmModal;
