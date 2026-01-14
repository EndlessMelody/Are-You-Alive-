import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
// Lazy Load Components
const Onboarding = React.lazy(() => import("./components/Onboarding"));
const Dashboard = React.lazy(() => import("./components/Dashboard"));
const HistoryView = React.lazy(() => import("./components/History"));
const CosmicBackground = React.lazy(() =>
  import("./components/CosmicBackground")
);

// Loading Fallback
const CosmicLoader = () => (
  <div
    style={{
      width: "100vw",
      height: "100vh",
      background: "#050508",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#475569",
    }}
  >
    Initializing Sentient Core...
  </div>
);

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
      <React.Suspense fallback={<CosmicLoader />}>
        <CosmicBackground />

        <AnimatePresence>
          {!profile ? (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Onboarding onComplete={loadData} />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Dashboard
                profile={profile}
                stats={stats}
                onCheckIn={loadData}
                onShowHistory={() => setView("history")}
                onShowSettings={() => setProfile(null)}
              />
            </motion.div>
          )}
          <AnimatePresence>
            {view === "history" && (
              <HistoryView onClose={() => setView("main")} />
            )}
          </AnimatePresence>
        </AnimatePresence>
      </React.Suspense>

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
