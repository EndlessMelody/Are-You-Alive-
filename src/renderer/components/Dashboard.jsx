import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsLightningChargeFill,
  BsShieldCheck,
  BsClockHistory,
  BsGear,
  BsClock,
  BsFeather,
} from "react-icons/bs";
import { FiHeart } from "react-icons/fi";
import MoodSelector from "./MoodSelector";
import Lifeline from "./Lifeline";

function Dashboard({
  profile,
  stats,
  onCheckIn,
  onShowHistory,
  onShowSettings,
}) {
  const [timeLeft, setTimeLeft] = useState(stats.timeRemaining);
  const [thought, setThought] = useState("");
  const [mood, setMood] = useState("neutral");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setTimeLeft(stats.timeRemaining);
    if (stats.warningActive && stats.timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [stats.warningActive, stats.timeRemaining]);

  useEffect(() => {
    const loadHistory = async () => {
      const data = await window.electronAPI.getHistory();
      setHistory(data);
    };
    loadHistory();
  }, [stats]);

  const handleCheckIn = async () => {
    await window.electronAPI.checkIn({ thought, mood });
    setThought("");
    onCheckIn();
  };

  const formatTime = (ms) => {
    if (ms === null) return "";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const progressPercent = stats.warningActive
    ? Math.min(100, (timeLeft / (12 * 60 * 60 * 1000)) * 100)
    : 100;
  const statusColor = stats.warningActive
    ? timeLeft < 4 * 60 * 60 * 1000
      ? "#ef4444"
      : "#f59e0b"
    : "#3b82f6";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="dashboard-v4"
    >
      <div className="custom-title-bar">
        <div className="title-left">
          <img src="../../assets/icon.png" className="mini-logo" />
          <span className="window-title">Are You Alive?</span>
        </div>
      </div>

      <Lifeline history={history} />

      <div className="top-pills">
        <div className="pill glass">
          <BsLightningChargeFill color="#f59e0b" />
          <span>{stats.streak} day streak</span>
        </div>
        <div className="pill glass">
          <BsShieldCheck color="#10b981" />
          <span>Active</span>
        </div>
        <div className="pill-actions">
          <button
            className="pill-btn glass"
            onClick={onShowHistory}
            title="History"
          >
            <BsClockHistory />
          </button>
          <button
            className="pill-btn glass"
            onClick={onShowSettings}
            title="Settings"
          >
            <BsGear />
          </button>
        </div>
      </div>

      <div className="central-area">
        <div className="heartbeat-container">
          <div className="pulse-circle" style={{ borderColor: statusColor }} />
          <div
            className="pulse-circle delay-1"
            style={{ borderColor: statusColor }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="heartbeat-btn"
            style={{
              boxShadow: `0 0 50px ${statusColor}33`,
              borderColor: statusColor,
            }}
            onClick={handleCheckIn}
          >
            <FiHeart size={40} className="heart-icon" />
            <span className="btn-main">I'm Alive</span>
            <span className="btn-sub">Confirm Pulse</span>
          </motion.button>
        </div>

        {stats.warningActive && (
          <div className="countdown-container">
            <div className="countdown-text">
              <BsClock />
              <span>Alert in: {formatTime(timeLeft)}</span>
            </div>
            <div className="progress-bar-bg">
              <motion.div
                className="progress-bar-fill"
                animate={{
                  width: `${progressPercent}%`,
                  backgroundColor: statusColor,
                }}
              />
            </div>
          </div>
        )}

        <div className="interaction-grid">
          <MoodSelector selectedMood={mood} onSelect={setMood} />
          <div className="thought-journal glass">
            <BsFeather className="journal-icon" />
            <input
              type="text"
              placeholder="A thought for the cosmic void..."
              className="journal-input"
              value={thought}
              onChange={(e) => setThought(e.target.value)}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-v4 {
          height: 100vh;
          width: 100vw;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 20px 40px 40px 40px;
          background: transparent;
        }

        .custom-title-bar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 40px;
          display: flex;
          align-items: center;
          padding: 0 20px;
          -webkit-app-region: drag;
          z-index: 1000;
        }
        .title-left {
          display: flex;
          align-items: center;
          gap: 10px;
          -webkit-app-region: no-drag;
        }
        .mini-logo {
          width: 18px;
          height: 18px;
          border-radius: 4px;
        }
        .window-title {
          font-family: "Outfit";
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          opacity: 0.8;
        }

        .top-pills {
          display: flex;
          gap: 16px;
          z-index: 10;
          margin-top: 30px;
        }
        .pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px;
          font-family: "Outfit", sans-serif;
          font-size: 0.85rem;
        }
        .pill-actions {
          display: flex;
          gap: 10px;
        }
        .pill-btn {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 10px;
          font-size: 1.1rem;
          color: var(--text-secondary);
        }
        .pill-btn:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }

        .central-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 50px;
        }
        .heartbeat-container {
          position: relative;
          width: 300px;
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .heartbeat-btn {
          width: 240px;
          height: 240px;
          border-radius: 50%;
          background: var(--bg-glass);
          border: 2px solid;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 2;
          color: white;
          backdrop-filter: blur(10px);
        }
        .btn-main {
          font-family: "Outfit", sans-serif;
          font-size: 2rem;
          font-weight: 700;
        }
        .btn-sub {
          font-size: 0.8rem;
          opacity: 0.5;
          margin-top: 4px;
        }

        .pulse-circle {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 1px solid;
          border-radius: 50%;
          animation: heart-pulse 4s infinite ease-out;
          opacity: 0;
        }
        .delay-1 {
          animation-delay: 2s;
        }
        @keyframes heart-pulse {
          0% {
            transform: scale(0.8);
            opacity: 0.4;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }

        .countdown-container {
          width: 350px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: center;
        }
        .countdown-text {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
          font-size: 0.85rem;
        }
        .progress-bar-bg {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 2px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          border-radius: 2px;
        }

        .interaction-grid {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }
        .thought-journal {
          width: 450px;
          padding: 12px 24px;
          border-radius: 50px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .journal-icon {
          color: var(--text-secondary);
          opacity: 0.6;
        }
        .journal-input {
          background: transparent;
          border: none;
          color: white;
          flex: 1;
          outline: none;
          font-family: "Inter", sans-serif;
          font-size: 0.95rem;
          text-align: center;
        }
      `}</style>
    </motion.div>
  );
}

export default Dashboard;
