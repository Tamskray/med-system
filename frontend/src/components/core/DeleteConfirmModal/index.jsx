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
  isLoading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Confirm Delete"
      onSubmit={onConfirm}
      submitText="Delete"
      submitMode={BUTTON_MODES.ERROR_FILLED}
      submitDisabled={isLoading}
    >
      <Box sx={{ mt: 1 }}>
        <Typography>
          Are you sure you want to delete <strong>{itemName || `this ${itemLabel}`}</strong>?
        </Typography>
      </Box>
    </Modal>
  );
}

export default DeleteConfirmModal;
