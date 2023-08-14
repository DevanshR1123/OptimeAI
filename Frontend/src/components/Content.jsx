import { Route, Routes } from "react-router-dom";
import { AuthRequired } from "./contexts/Auth";
import { Dashboard } from "./pages/Dashboard";
import Home from "./pages/Home";
import Navbar from "./Navbar";

const Content = () => {
  return (
    <>
      <header>
        <Navbar />
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/dashboard"
            element={<AuthRequired element={<Dashboard />} />}
          />
        </Routes>
      </main>
      <footer className="bg-gray-500 text-center font-bold">
        OptimeAI &copy; {new Date().getFullYear()}
      </footer>
    </>
  );
};

export default Content;
