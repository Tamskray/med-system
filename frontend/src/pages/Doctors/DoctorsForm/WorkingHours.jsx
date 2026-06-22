import { useCallback, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Tooltip from "../../../components/core/Tooltip";

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
const WORKING_HOURS_STEP_MINUTES = 15;

const timeToMinutes = (value) => {
  const [hours = 0, minutes = 0] = String(value || "00:00")
    .slice(0, 5)
    .split(":")
    .map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (total) => {
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
};

function WorkingHours({ workingHours, onChange, slotDurationMinutes = 30 }) {
  const appointmentStepMinutes = Number(slotDurationMinutes) > 0 ? Number(slotDurationMinutes) : 30;

  const timeOptions = useMemo(() => {
    const options = [];
    for (
      let total = CLINIC_START_MINUTES;
      total <= CLINIC_END_MINUTES;
      total += WORKING_HOURS_STEP_MINUTES
    ) {
      options.push(minutesToTime(total));
    }
    return options;
  }, []);

  const startOptions = useMemo(
    () =>
      timeOptions.filter(
        (option) => timeToMinutes(option) <= CLINIC_END_MINUTES - appointmentStepMinutes,
      ),
    [timeOptions, appointmentStepMinutes],
  );

  const normalizeToStep = useCallback((value, mode = "floor") => {
    const total = timeToMinutes(value);
    const relative = total - CLINIC_START_MINUTES;
    const stepped =
      mode === "ceil"
        ? Math.ceil(relative / WORKING_HOURS_STEP_MINUTES)
        : Math.floor(relative / WORKING_HOURS_STEP_MINUTES);
    const normalized = Math.min(
      CLINIC_END_MINUTES,
      Math.max(CLINIC_START_MINUTES, CLINIC_START_MINUTES + stepped * WORKING_HOURS_STEP_MINUTES),
    );
    return minutesToTime(normalized);
  }, []);

  const getValidEndOptions = useCallback(
    (startValue) => {
      if (!startValue) return [];

      const startMinutes = timeToMinutes(startValue);
      const options = [];

      for (
        let endMinutes = startMinutes + appointmentStepMinutes;
        endMinutes <= CLINIC_END_MINUTES;
        endMinutes += appointmentStepMinutes
      ) {
        options.push(minutesToTime(endMinutes));
      }

      return options;
    },
    [appointmentStepMinutes],
  );

  useEffect(() => {
    const normalized = (workingHours || []).map((wh) => {
      const rawStart = String(wh.start_time || "").slice(0, 5);
      const rawEnd = String(wh.end_time || "").slice(0, 5);

      if (!rawStart) {
        return {
          ...wh,
          start_time: "",
          end_time: "",
        };
      }

      let start = normalizeToStep(rawStart, "floor");
      const maxStartMinutes = CLINIC_END_MINUTES - appointmentStepMinutes;
      if (timeToMinutes(start) > maxStartMinutes) {
        start = minutesToTime(maxStartMinutes);
      }

      const allowedEndOptions = getValidEndOptions(start);
      const normalizedEndCandidate = rawEnd ? normalizeToStep(rawEnd, "ceil") : "";
      const end =
        allowedEndOptions.find(
          (option) => timeToMinutes(option) >= timeToMinutes(normalizedEndCandidate),
        ) ||
        allowedEndOptions[0] ||
        "";

      return {
        ...wh,
        start_time: start ? `${start}:00` : "",
        end_time: end ? `${end}:00` : "",
      };
    });

    const changed = JSON.stringify(normalized) !== JSON.stringify(workingHours || []);
    if (changed) {
      onChange(normalized);
    }
  }, [workingHours, onChange, appointmentStepMinutes, normalizeToStep, getValidEndOptions]);

  const workingHoursByDay = {};
  (workingHours || []).forEach((wh) => {
    workingHoursByDay[wh.day_of_week] = wh;
  });

  const handleToggleDay = (dayOfWeek) => {
    const isActive = workingHoursByDay[dayOfWeek];

    if (isActive) {
      const updated = (workingHours || []).filter((wh) => wh.day_of_week !== dayOfWeek);
      onChange(updated);
      return;
    }

    const updated = [
      ...(workingHours || []),
      {
        day_of_week: dayOfWeek,
        start_time: "",
        end_time: "",
      },
    ];
    onChange(updated);
  };

  const handleTimeChange = (dayOfWeek, field, value) => {
    const updated = (workingHours || []).map((wh) => {
      if (wh.day_of_week !== dayOfWeek) return wh;

      if (field === "start_time") {
        const nextStart = value ? `${value}:00` : "";
        const endOptions = getValidEndOptions(value);
        const currentEnd = String(wh.end_time || "").slice(0, 5);
        const nextEnd = endOptions.includes(currentEnd) ? currentEnd : endOptions[0] || "";

        return {
          ...wh,
          start_time: nextStart,
          end_time: nextEnd ? `${nextEnd}:00` : "",
        };
      }

      if (field === "end_time") {
        return { ...wh, end_time: value ? `${value}:00` : "" };
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
          const startTime = dayHours?.start_time ? dayHours.start_time.slice(0, 5) : "";
          const endTime = dayHours?.end_time ? dayHours.end_time.slice(0, 5) : "";
          const endOptions = getValidEndOptions(startTime);
          const slotCount =
            startTime && endTime
              ? Math.floor(
                  (timeToMinutes(endTime) - timeToMinutes(startTime)) / appointmentStepMinutes,
                )
              : 0;

          return (
            <Box
              key={day.value}
              sx={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto auto auto",
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
                    <MenuItem value="">
                      <em>Початок</em>
                    </MenuItem>
                    {startOptions.map((option) => (
                      <MenuItem key={`start-${day.value}-${option}`} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>

                  <Typography sx={{ fontWeight: 500, fontSize: 14 }}>—</Typography>

                  {!startTime ? (
                    <Tooltip title="Спочатку оберіть початок робочих годин">
                      <Box component="span" sx={{ display: "inline-flex" }}>
                        <TextField
                          select
                          value=""
                          disabled
                          size="small"
                          sx={{ width: 120, "& .MuiInputBase-input": { fontSize: 14 } }}
                        >
                          <MenuItem value="">
                            <em>Кінець</em>
                          </MenuItem>
                        </TextField>
                      </Box>
                    </Tooltip>
                  ) : (
                    <TextField
                      select
                      value={endTime}
                      onChange={(e) => handleTimeChange(day.value, "end_time", e.target.value)}
                      size="small"
                      sx={{ width: 120, "& .MuiInputBase-input": { fontSize: 14 } }}
                    >
                      {endOptions.map((option) => (
                        <MenuItem key={`end-${day.value}-${option}`} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}

                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 88 }}>
                    Слотів: {slotCount}
                  </Typography>
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
