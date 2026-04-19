import { useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";

const DAYS_OF_WEEK = [
  { value: 0, label: "Понеділок" },
  { value: 1, label: "Вівторок" },
  { value: 2, label: "Середа" },
  { value: 3, label: "Четвер" },
  { value: 4, label: "П'ятниця" },
  { value: 5, label: "Субота" },
  { value: 6, label: "Неділя" },
];

const CLINIC_START_MINUTES = 8 * 60;
const CLINIC_END_MINUTES = 20 * 60;

function WorkingHours({ workingHours, onChange, slotDurationMinutes = 30 }) {
  const stepMinutes = Number(slotDurationMinutes) > 0 ? Number(slotDurationMinutes) : 30;

  const timeOptions = useMemo(() => {
    const options = [];
    for (let total = CLINIC_START_MINUTES; total <= CLINIC_END_MINUTES; total += stepMinutes) {
      const hh = String(Math.floor(total / 60)).padStart(2, "0");
      const mm = String(total % 60).padStart(2, "0");
      options.push(`${hh}:${mm}`);
    }
    return options;
  }, [stepMinutes]);

  const normalizeToStep = (value, mode = "floor") => {
    const [hours = 0, minutes = 0] = String(value || "00:00")
      .slice(0, 5)
      .split(":")
      .map(Number);
    const total = hours * 60 + minutes;
    const stepped =
      mode === "ceil" ? Math.ceil(total / stepMinutes) : Math.floor(total / stepMinutes);
    const normalized = Math.min(
      CLINIC_END_MINUTES,
      Math.max(CLINIC_START_MINUTES, stepped * stepMinutes),
    );
    const hh = String(Math.floor(normalized / 60)).padStart(2, "0");
    const mm = String(normalized % 60).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  useEffect(() => {
    const normalized = (workingHours || []).map((wh) => {
      const start = normalizeToStep(wh.start_time, "floor");
      let end = normalizeToStep(wh.end_time, "ceil");
      if (end <= start) {
        const [h, m] = start.split(":").map(Number);
        const next = h * 60 + m + stepMinutes;
        const hh = String(Math.min(23, Math.floor(next / 60))).padStart(2, "0");
        const mm = String(next % 60).padStart(2, "0");
        end = `${hh}:${mm}`;
      }
      return {
        ...wh,
        start_time: `${start}:00`,
        end_time: `${end}:00`,
      };
    });

    const changed = JSON.stringify(normalized) !== JSON.stringify(workingHours || []);
    if (changed) {
      onChange(normalized);
    }
  }, [workingHours, onChange, stepMinutes]);

  const workingHoursByDay = {};
  (workingHours || []).forEach((wh) => {
    workingHoursByDay[wh.day_of_week] = wh;
  });

  const handleToggleDay = (dayOfWeek) => {
    const isActive = workingHoursByDay[dayOfWeek];

    if (isActive) {
      // Remove this day
      const updated = (workingHours || []).filter((wh) => wh.day_of_week !== dayOfWeek);
      onChange(updated);
    } else {
      // Add this day with default times
      const updated = [
        ...(workingHours || []),
        {
          day_of_week: dayOfWeek,
          start_time: `${normalizeToStep("09:00")}:00`,
          end_time: `${normalizeToStep("17:00", "ceil")}:00`,
        },
      ];
      onChange(updated);
    }
  };

  const handleTimeChange = (dayOfWeek, field, value) => {
    const updated = (workingHours || []).map((wh) => {
      if (wh.day_of_week === dayOfWeek) {
        // Convert HH:mm to HH:mm:ss if needed
        let timeValue = value;
        if (value && !value.includes(":00", value.lastIndexOf(":"))) {
          timeValue = `${value}:00`;
        }
        return { ...wh, [field]: timeValue };
      }
      return wh;
    });
    onChange(updated);
  };

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 2,
      }}
    >
      <Typography sx={{ mb: 2, fontWeight: 600, fontSize: 14 }}>Робочі години</Typography>

      <Box sx={{ display: "grid", gap: 2 }}>
        {DAYS_OF_WEEK.map((day) => {
          const dayHours = workingHoursByDay[day.value];
          const isActive = Boolean(dayHours);
          const startTime = dayHours?.start_time ? dayHours.start_time.slice(0, 5) : "09:00";
          const endTime = dayHours?.end_time ? dayHours.end_time.slice(0, 5) : "17:00";

          return (
            <Box
              key={day.value}
              sx={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto auto",
                alignItems: "center",
                gap: 2,
                p: 1.5,
                borderRadius: 1,
                bgcolor: isActive ? "action.hover" : "grey.50",
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isActive}
                    onChange={() => handleToggleDay(day.value)}
                    size="small"
                  />
                }
                label={
                  <Typography sx={{ fontWeight: 500, minWidth: 120, fontSize: 14 }}>
                    {day.label}
                  </Typography>
                }
                sx={{ m: 0 }}
              />

              {isActive && (
                <>
                  <TextField
                    select
                    value={startTime}
                    onChange={(e) => handleTimeChange(day.value, "start_time", e.target.value)}
                    size="small"
                    sx={{ width: 120, "& .MuiInputBase-input": { fontSize: 14 } }}
                  >
                    {timeOptions.map((option) => (
                      <MenuItem key={`start-${day.value}-${option}`} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Typography sx={{ fontWeight: 500, fontSize: 14 }}>—</Typography>
                  <TextField
                    select
                    value={endTime}
                    onChange={(e) => handleTimeChange(day.value, "end_time", e.target.value)}
                    size="small"
                    sx={{ width: 120, "& .MuiInputBase-input": { fontSize: 14 } }}
                  >
                    {timeOptions.map((option) => (
                      <MenuItem key={`end-${day.value}-${option}`} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default WorkingHours;
