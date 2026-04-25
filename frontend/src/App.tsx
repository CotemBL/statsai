import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import PlayerPage from "./pages/PlayerPage";
import HeroesPage from "./pages/HeroesPage";
import HeroPage from "./pages/HeroPage";
import MatchPage from "./pages/MatchPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/players/:accountId" element={<PlayerPage />} />
        <Route path="/heroes" element={<HeroesPage />} />
        <Route path="/heroes/:heroId" element={<HeroPage />} />
        <Route path="/matches/:matchId" element={<MatchPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
