import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const languages = [
    { code: "uk", label: "UA" },
    { code: "en", label: "EN" },
  ];

  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant={i18n.language === lang.code ? "contained" : "outlined"}
          size="small"
          onClick={() => i18n.changeLanguage(lang.code)}
          sx={{
            minWidth: "40px",
            padding: "4px 8px",
            fontWeight: i18n.language === lang.code ? 600 : 400,
          }}
        >
          {lang.label}
        </Button>
      ))}
    </Box>
  );
}
