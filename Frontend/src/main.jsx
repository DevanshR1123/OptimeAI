import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./components/contexts/Auth";
import { CalendarProvider } from "./components/contexts/Calendar";
import "./index.css";
import Content from "./components/Content";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CalendarProvider>
          <Content />
        </CalendarProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
