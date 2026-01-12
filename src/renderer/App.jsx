import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Onboarding from "./components/Onboarding";
import Dashboard from "./components/Dashboard";
import HistoryView from "./components/History";
import CosmicBackground from "./components/CosmicBackground";

function App() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ streak: 0, lastCheckin: null });
  const [view, setView] = useState("main"); // 'main' or 'history'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const p = await window.electronAPI.getProfile();
      const s = await window.electronAPI.getStats();
      setProfile(p);
      setStats(s);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div className="app-container">
      <CosmicBackground />

      <AnimatePresence mode="wait">
        {!profile ? (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
          >
            <Onboarding onComplete={loadData} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Dashboard
              profile={profile}
              stats={stats}
              onCheckIn={loadData}
              onShowHistory={() => setView("history")}
              onShowSettings={() => setProfile(null)}
            />

            <AnimatePresence>
              {view === "history" && (
                <HistoryView onClose={() => setView("main")} />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .app-container {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
export default App;
