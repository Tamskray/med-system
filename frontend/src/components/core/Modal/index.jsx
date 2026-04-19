import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button, { BUTTON_MODES } from "../Button";

const Modal = ({
  open,
  onClose,
  title,
  children,
  onSubmit,
  submitText = "Save",
  cancelText = "Cancel",
  maxWidth = "sm",
  submitMode = BUTTON_MODES.DEFAULT,
  submitSx = {},
  submitDisabled = false,
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={maxWidth}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      <DialogActions>
        <Button mode={BUTTON_MODES.SECONDARY} onClick={onClose}>
          {cancelText}
        </Button>
        <Button mode={submitMode} onClick={onSubmit} sx={submitSx} disabled={submitDisabled}>
          {submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Modal;
