import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";

import {
  chartBoxSx,
  chartHeaderSx,
  filtersSx,
  pageWrapperSx,
  sectionTitleSx,
  summaryPaperSx,
  titleSx,
} from "./styles";
import BarChart from "./Charts/BarChart";
import Charts from "./Charts";
import { useStatistics } from "./useStatistics";

export default function Statistics() {
  const {
    chartDates,
    chartOptions,
    chartType,
    dailyCounts,
    isChartAvailable,
    isLoading,
    isWorkloadLoading,
    rangeDays,
    rangeOptions,
    selectedDoctor,
    selectedDoctorId,
    sortedDoctors,
    statusCounts,
    totalAppointments,
    totalWorkload,
    workloadByDoctor,
    getDoctorFullName,
    setChartType,
    setRangeDays,
    setSelectedDoctorId,
  } = useStatistics();

  return (
    <Box sx={pageWrapperSx}>
      <Typography variant="h6" sx={titleSx}>
        Статистика записів
      </Typography>

      <Box sx={filtersSx}>
        <FormControl size="small" sx={{ minWidth: 260 }}>
          <Select
            displayEmpty
            value={selectedDoctorId}
            onChange={(event) => setSelectedDoctorId(event.target.value)}
            renderValue={(value) => (value ? getDoctorFullName(selectedDoctor) : "Оберіть лікаря")}
          >
            <MenuItem value="">Оберіть лікаря</MenuItem>
            {sortedDoctors.map((doctor) => (
              <MenuItem key={doctor.id} value={doctor.id}>
                {getDoctorFullName(doctor)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <ToggleButtonGroup
          exclusive
          size="small"
          value={rangeDays}
          onChange={(_, value) => value && setRangeDays(value)}
        >
          {rangeOptions.map((option) => (
            <ToggleButton key={option.value} value={option.value}>
              {option.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {!isChartAvailable ? (
        <Typography color="text.secondary">Оберіть лікаря для перегляду статистики</Typography>
      ) : isLoading ? (
        <Box sx={chartBoxSx}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <>
          <Box sx={chartHeaderSx}>
            <Paper variant="outlined" elevation={0} sx={summaryPaperSx}>
              <Typography variant="body2" color="text.secondary">
                Записів за період
              </Typography>
              <Typography variant="h4">{totalAppointments}</Typography>
            </Paper>

            <ToggleButtonGroup
              exclusive
              size="small"
              value={chartType}
              onChange={(_, value) => value && setChartType(value)}
              aria-label="Тип графіка"
            >
              {Object.entries(chartOptions).map(([value, label]) => (
                <ToggleButton key={value} value={value}>
                  {label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
          <Paper variant="outlined" elevation={0} sx={chartBoxSx}>
            <Charts
              chartType={chartType}
              chartDates={chartDates}
              dailyCounts={dailyCounts}
              statusCounts={statusCounts}
            />
          </Paper>
        </>
      )}

      <Typography variant="subtitle1" sx={sectionTitleSx}>
        Навантаження лікарів
      </Typography>

      {isWorkloadLoading ? (
        <Box sx={chartBoxSx}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <>
          <Paper variant="outlined" elevation={0} sx={summaryPaperSx}>
            <Typography variant="body2" color="text.secondary">
              Записів у всіх лікарів
            </Typography>
            <Typography variant="h4">{totalWorkload}</Typography>
          </Paper>
          <Paper variant="outlined" elevation={0} sx={chartBoxSx}>
            <BarChart
              workloadByDoctor={workloadByDoctor}
              sortedDoctors={sortedDoctors}
              getDoctorFullName={getDoctorFullName}
            />
          </Paper>
        </>
      )}
    </Box>
  );
}
