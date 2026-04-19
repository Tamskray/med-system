import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
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

function WorkingHours({ workingHours, onChange }) {
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
          start_time: "09:00:00",
          end_time: "17:00:00",
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
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Робочі години
        </Typography>

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
                    <Typography sx={{ fontWeight: 500, minWidth: 120 }}>{day.label}</Typography>
                  }
                  sx={{ m: 0 }}
                />

                {isActive && (
                  <>
                    <TextField
                      type="time"
                      value={startTime}
                      onChange={(e) => handleTimeChange(day.value, "start_time", e.target.value)}
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      sx={{ width: 120 }}
                    />
                    <Typography sx={{ fontWeight: 500 }}>—</Typography>
                    <TextField
                      type="time"
                      value={endTime}
                      onChange={(e) => handleTimeChange(day.value, "end_time", e.target.value)}
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      sx={{ width: 120 }}
                    />
                  </>
                )}
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}

export default WorkingHours;
