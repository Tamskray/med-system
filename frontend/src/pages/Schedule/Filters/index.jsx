import { useMemo } from "react";

import dayjs from "dayjs";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import "dayjs/locale/uk";
import { dateSelectorSx, dateFieldSx, filtersGridSx } from "../styles";

export default function ScheduleFilters({
  selectedDate,
  onPreviousDay,
  onNextDay,
  onDateChange,
  selectedDepartment,
  onDepartmentChange,
  departmentOptions,
  selectedDoctorId,
  onDoctorChange,
  doctorOptions,
  patientSearchInput,
  onPatientSearchInputChange,
}) {
  const pickerValue = useMemo(() => (selectedDate ? dayjs(selectedDate) : null), [selectedDate]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="uk">
      <Box sx={filtersGridSx}>
        <Box sx={dateSelectorSx}>
          <IconButton aria-label="Попередній день" onClick={onPreviousDay} size="small">
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <DatePicker
            label="Дата"
            value={pickerValue}
            onChange={(value) => onDateChange(value ? value.format("YYYY-MM-DD") : "")}
            format="DD.MM.YYYY"
            slotProps={{
              textField: {
                size: "small",
                sx: dateFieldSx,
                onKeyDown: (event) => event.preventDefault(),
              },
            }}
          />
          <IconButton aria-label="Наступний день" onClick={onNextDay} size="small">
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>

        <TextField
          label="Відділення"
          select
          value={selectedDepartment}
          onChange={onDepartmentChange}
          size="small"
          fullWidth
          SelectProps={{ MenuProps: { sx: { maxHeight: 300 } } }}
        >
          <MenuItem value="">Усі</MenuItem>
          {departmentOptions.map((department) => (
            <MenuItem key={department} value={department}>
              {department}
            </MenuItem>
          ))}
        </TextField>

        <Autocomplete
          options={doctorOptions}
          value={
            doctorOptions.find((doctor) => Number(doctor.id) === Number(selectedDoctorId)) || null
          }
          onChange={onDoctorChange}
          getOptionLabel={(option) =>
            [option.last_name, option.first_name].filter(Boolean).join(" ")
          }
          isOptionEqualToValue={(option, value) => Number(option.id) === Number(value.id)}
          renderInput={(params) => (
            <TextField {...params} label="Лікар" size="small" placeholder="Пошук" />
          )}
          size="small"
          fullWidth
          noOptionsText="Лікарів не знайдено"
        />

        <TextField
          label="Пошук пацієнта"
          value={patientSearchInput}
          onChange={onPatientSearchInputChange}
          placeholder="Пацієнт у слотах"
          fullWidth
          size="small"
        />
      </Box>
    </LocalizationProvider>
  );
}
