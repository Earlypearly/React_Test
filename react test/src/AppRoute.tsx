import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login/Login";
import SignUp from "./pages/signup/SignUp";
import DashBoard from "./pages/dashboard/DashBoard";

const AppRoute = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard" element={<DashBoard />} />
      <Route path="/" element={<Login />} /> {/* fallback */}
    </Routes>
  </BrowserRouter>
);

export default AppRoute;
