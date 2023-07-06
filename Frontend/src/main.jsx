import React from "react";
import ReactDOM from "react-dom/client";
import OptimeAI from "./App";
import "./index.css";
import { AuthProvider } from "./components/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <OptimeAI />
    </AuthProvider>
  </React.StrictMode>
);
