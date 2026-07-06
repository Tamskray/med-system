import Box from "@mui/material/Box";

import { BREAK } from "../constants";

export const getAppointmentPatientFullName = (appointment) => {
  if (!appointment?.patients) return "Без пацієнта";

  const fullName = [
    appointment.patients.last_name,
    appointment.patients.first_name,
    appointment.patients.middle_name,
  ]
    .filter(Boolean)
    .join(" ");

  return fullName || "Без пацієнта";
};

export const getTimeOffLabel = (timeOff) => {
  if (!timeOff) return "Лікар не працює у цей день";

  return timeOff.reason ? `${timeOff.reason}` : "Лікар має вихідний на вибрану дату";
};

export const getSlotTooltipContent = (
  block,
  occupied,
  appointment,
  getAppointmentPatientFullName,
  canCreate,
) => {
  if (!occupied) {
    return (
      <Box>
        <Box>
          Час: {block.start} - {block.end}
        </Box>
        <Box>Статус: Вільний слот</Box>
        <Box>
          {canCreate
            ? "Натисніть, щоб створити запис"
            : "За вашою роллю створення слотів недоступне"}
        </Box>
      </Box>
    );
  }

  if (appointment?.appointment_type === BREAK) {
    return (
      <Box>
        <Box>
          Час: {block.start} - {block.end}
        </Box>
        <Box>Статус: Перерва</Box>
        {appointment.notes && <Box>Примітка: {appointment.notes}</Box>}
      </Box>
    );
  }

  return (
    <Box>
      <Box>
        Час: {block.start} - {block.end}
      </Box>
      <Box>Статус: {appointment?.status || "Заплановано"}</Box>
      <Box>Тип: {appointment?.appointment_type || "Консультація"}</Box>
      <Box>Пацієнт: {getAppointmentPatientFullName(appointment)}</Box>
    </Box>
  );
};

export const getSlotPalette = (appointment, slotIndex) => {
  if (!appointment) {
    return {
      bg: slotIndex % 2 === 0 ? "grey.50" : "grey.100",
      hoverBg: "primary.50",
      text: "text.secondary",
    };
  }

  // Break slot styling
  if (appointment.appointment_type === BREAK) {
    return { bg: "#d9d9d9", hoverBg: "#c9c9c9", text: "text.primary" };
  }

  const status = appointment.status || "Заплановано";
  if (status === "Завершено") {
    return { bg: "info.light", hoverBg: "info.main", text: "text.primary" };
  }
  if (status === "Скасовано") {
    return { bg: "error.light", hoverBg: "error.main", text: "text.primary" };
  }
  if (status === "Прибув") {
    return { bg: "warning.light", hoverBg: "warning.main", text: "text.primary" };
  }
  if (status === "В процесі") {
    return { bg: "secondary.light", hoverBg: "secondary.main", text: "text.primary" };
  }
  return { bg: "success.light", hoverBg: "success.main", text: "text.primary" };
};
