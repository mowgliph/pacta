import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ClientRootLayout } from "./components/ui/ClientRootLayout";
import "./styles/globals.css";
import Dashboard from "./app/dashboard/page";
import Login from "./app/login/page";
import Users from "./app/users/page";
import Settings from "./app/settings/page";
import Statistics from "./app/statistics/page";
import Contracts from "./app/contracts/page";
// Puedes agregar más rutas según tu estructura

const App = () => (
  <BrowserRouter>
    <ClientRootLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/users" element={<Users />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/contracts" element={<Contracts />} />
        {/* Agrega aquí más rutas según tu estructura */}
      </Routes>
    </ClientRootLayout>
  </BrowserRouter>
);

export default App;
