import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider, AuthRequired } from "./components/contexts/Auth";
import "./index.css";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import { Dashboard } from "./pages/Dashboard";
import { CalendarProvider } from "./components/contexts/Calendar";

import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env["VITE_SUPABASE_PROJECT_URL"],
  import.meta.env["VITE_SUPABASE_CLIENT_KEY"]
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SessionContextProvider supabaseClient={supabase}>
      <AuthProvider>
        <CalendarProvider>
          <BrowserRouter>
            <header>
              <Navbar />
            </header>
            <main>
              <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/dashboard' element={<AuthRequired element={<Dashboard />} />} />
              </Routes>
            </main>
            <footer className='bg-gray-500 text-center font-bold'>
              OptimeAI &copy; {new Date().getFullYear()}
            </footer>
          </BrowserRouter>
        </CalendarProvider>
      </AuthProvider>
    </SessionContextProvider>
  </React.StrictMode>
);
