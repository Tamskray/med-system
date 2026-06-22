import MuiTooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";

const StyledTooltip = styled(({ className, ...props }) => (
  <MuiTooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[2],
    fontSize: 12,
    lineHeight: 1.35,
    padding: theme.spacing(1, 1.25),
    maxWidth: 260,
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.white,
    "&::before": {
      border: `1px solid ${theme.palette.divider}`,
      boxSizing: "border-box",
    },
  },
}));

function Tooltip(props) {
  return <StyledTooltip arrow placement="top" disableInteractive {...props} />;
}

export default Tooltip;
