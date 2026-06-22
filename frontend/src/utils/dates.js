const getTodayIsoDate = () => new Date().toISOString().slice(0, 10);

const toIsoDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const shiftIsoDate = (isoDate, daysDelta) => {
  const [year, month, day] = String(isoDate).split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + daysDelta);
  return toIsoDate(date);
};

const getDbDayOfWeekFromIsoDate = (isoDate) => {
  const [year, month, day] = String(isoDate).split("-").map(Number);
  const localDate = new Date(year, month - 1, day);
  return (localDate.getDay() + 6) % 7;
};

const timeToMinutes = (time) => {
  const [hours, minutes] = String(time).split(":").map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
  const normalizedMinutes = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(normalizedMinutes / 60)
    .toString()
    .padStart(2, "0");
  const mins = (normalizedMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${mins}`;
};

export {
  getTodayIsoDate,
  toIsoDate,
  shiftIsoDate,
  getDbDayOfWeekFromIsoDate,
  timeToMinutes,
  minutesToTime,
};
