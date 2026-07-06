import SearchIcon from "@mui/icons-material/Search";
import FormControl from "@mui/material/FormControl";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";

const SearchInput = ({ value, onChange, placeholder = "Search...", sx = {}, ...props }) => {
  return (
    <FormControl sx={{ width: "100%", ...sx }}>
      <OutlinedInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        size="small"
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        }
        sx={{ borderRadius: 2 }}
        {...props}
      />
    </FormControl>
  );
};

export default SearchInput;
