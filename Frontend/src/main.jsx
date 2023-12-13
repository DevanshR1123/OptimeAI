import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./components/contexts/Auth";
import { CalendarProvider } from "./components/contexts/Calendar";
import { LLMProvider } from "./components/contexts/LLM";
import "./index.css";
import Content from "./components/Content";
import { Toaster } from "sonner";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CalendarProvider>
          <LLMProvider>
            <Content />
            <Toaster />
          </LLMProvider>
        </CalendarProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
