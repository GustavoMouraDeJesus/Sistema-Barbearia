import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Agendamentos from "./pages/Agedamentos";
import Admin from "./pages/Admin";
import AdminDia from "./pages/AdminDia";

function App() {
  const location = useLocation();

  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminPage && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/agendamento" element={<Agendamentos />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/dia" element={<AdminDia />} />
      </Routes>
    </>
  );
}

export default App;