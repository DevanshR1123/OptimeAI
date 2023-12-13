import { Route, Routes } from "react-router-dom";
import { AuthRequired } from "./contexts/Auth";
import { Dashboard } from "./pages/Dashboard";
import Home from "./pages/Home";
import Navbar from "./Navbar";
import Timetable from "./pages/Timetable";

const Content = () => {
  return (
    <>
      <header>
        <Navbar />
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<AuthRequired element={<Dashboard />} />} />
          <Route path="/timetable" element={<AuthRequired element={<Timetable />} />} />
          <Route path="/*" element={<div className="grid h-full place-items-center text-6xl">Coming Soon...</div>} />
        </Routes>
      </main>
      {/* <footer className="bg-gray-500 text-center font-bold">OptimeAI &copy; {new Date().getFullYear()}</footer> */}
    </>
  );
};

export default Content;
