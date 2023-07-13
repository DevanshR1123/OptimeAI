import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AuthProvider, AuthRequired } from "./components/contexts/Auth";
import { CalendarProvider } from "./components/contexts/Calendar";
import "./index.css";
import { Dashboard } from "./pages/Dashboard";
import Home from "./pages/Home";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
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
          <footer className='bg-gray-500 text-center font-bold'>OptimeAI &copy; {new Date().getFullYear()}</footer>
        </BrowserRouter>
      </CalendarProvider>
    </AuthProvider>
  </React.StrictMode>
);
