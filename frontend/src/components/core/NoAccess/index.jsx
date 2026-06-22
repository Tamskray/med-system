import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import { containerSx, iconSx, descriptionSx } from "./styles";

export default function NoAccess() {
  return (
    <Box sx={containerSx}>
      <LockOutlinedIcon sx={iconSx} />
      <Typography variant="h6" color="text.secondary" fontWeight={600}>
        Доступ заборонено
      </Typography>
      <Typography variant="body2" color="text.disabled" sx={descriptionSx}>
        У вас недостатньо прав для перегляду цієї сторінки. Зверніться до адміністратора.
      </Typography>
    </Box>
  );
}
