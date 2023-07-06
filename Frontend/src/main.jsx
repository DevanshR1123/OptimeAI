import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./components/Auth";
import "./index.css";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import OptimeAI from "./Home";
import Navbar from "./components/Navbar";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <header>
          <Navbar />
        </header>
        <main>
          <Routes>
            <Route path='/' element={<OptimeAI />} />
          </Routes>
        </main>
        <footer className='bg-gray-500 text-center font-bold'>
          OptimeAI &copy; {new Date().getFullYear()}
        </footer>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
