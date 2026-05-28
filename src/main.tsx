import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminLogin } from "./pages/AdminLogin";
import { Home } from "./pages/Home";
import { HospitalDashboard } from "./pages/HospitalDashboard";
import { HospitalLogin } from "./pages/HospitalLogin";
import { ProfileAccess } from "./pages/ProfileAccess";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hospital" element={<HospitalLogin />} />
          <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/profile/:publicId" element={<ProfileAccess />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
