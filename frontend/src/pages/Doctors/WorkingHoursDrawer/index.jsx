import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";

import { WEEK_DAYS } from "../constants";
import {
  workingHoursDrawerPaperSx,
  workingHoursDrawerHeaderBoxSx,
  workingHoursDrawerLoadingBoxSx,
  workingHoursDrawerListSx,
} from "../styles";

const formatWorkingTime = (value) => String(value || "").slice(0, 5) || "--:--";

export default function WorkingHoursDrawer({
  open,
  onClose,
  doctorName,
  workingHoursByDay,
  isLoading,
}) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: workingHoursDrawerPaperSx }}
    >
      <Box sx={workingHoursDrawerHeaderBoxSx}>
        <Typography variant="h6">Графік роботи</Typography>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5 }}>
          {doctorName}
        </Typography>
      </Box>

      <Divider />

      {isLoading ? (
        <Box sx={workingHoursDrawerLoadingBoxSx}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <List sx={workingHoursDrawerListSx}>
          {WEEK_DAYS.map((dayLabel, index) => {
            const dayHours = workingHoursByDay.get(index);
            return (
              <ListItem key={dayLabel} divider>
                <ListItemText
                  primary={dayLabel}
                  secondary={
                    dayHours
                      ? `${formatWorkingTime(dayHours.start_time)} - ${formatWorkingTime(dayHours.end_time)}`
                      : "Вихідний"
                  }
                />
              </ListItem>
            );
          })}
        </List>
      )}
    </Drawer>
  );
}
