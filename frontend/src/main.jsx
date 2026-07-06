import { StrictMode } from "react";
import { BrowserRouter } from "react-router";

import { createRoot } from "react-dom/client";

import { Provider } from "react-redux";

import "./index.css";
import App from "./App.jsx";
import { store } from "./redux/index.js";
import { theme } from "./theme/index.js";

import { ThemeProvider } from "@mui/material/styles";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <ThemeProvider theme={theme}>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </ThemeProvider>,
  // </StrictMode>,
);
