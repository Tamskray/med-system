import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import "dayjs/locale/uk";

export default function DatePicker({ error, helperText, ...props }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="uk">
      <MuiDatePicker
        {...props}
        slotProps={{
          textField: {
            fullWidth: true,
            size: "small",
            error: Boolean(error),
            helperText: helperText,
            ...props.slotProps?.textField,
          },
          ...props.slotProps,
        }}
      />
    </LocalizationProvider>
  );
}
