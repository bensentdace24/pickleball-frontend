import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import PlayerView from "./pages/PlayerView";
import RankingsPage from "./pages/RankingsPage";
import StatusPage from "./pages/StatusPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PlayerView />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/rankings" element={<RankingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/status/:token" element={<StatusPage />} />
      </Routes>
    </BrowserRouter>
  );
}
