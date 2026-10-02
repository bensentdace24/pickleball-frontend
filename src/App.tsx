import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import PlayerView from "./pages/PlayerView";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PlayerView />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
