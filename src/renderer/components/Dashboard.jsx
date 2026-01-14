import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsLightningChargeFill,
  BsShieldCheck,
  BsClockHistory,
  BsGear,
  BsClock,
  BsFeather,
  BsSend,
} from "react-icons/bs";
import { GiAtomicSlashes } from "react-icons/gi";
import { FiHeart } from "react-icons/fi";
import { BsCalendar4Week } from "react-icons/bs";
import MoodSelector from "./MoodSelector";
import Lifeline from "./Lifeline";
import CosmicCalendar from "./CosmicCalendar";
import logoImg from "../assets/logo.jpg";

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
  const [showCalendar, setShowCalendar] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

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
    : stats.avgSentiment < -1
    ? "#6366f1" // Blue/Indigo for low sentiment
    : stats.avgSentiment > 1
    ? "#10b981" // Green/Emerald for high sentiment
    : "#3b82f6"; // Classic blue for neutral

  const getDynamicPrompt = () => {
    if (stats.avgSentiment < -1) return "Reflecting on the blue days...";
    if (stats.avgSentiment > 1) return "Channeling the solar energy...";
    if (stats.recentCheckins === 0) return "Begin the cosmic dialogue...";
    return "A thought for the cosmic void...";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="dashboard-v4"
      style={{ "--aura-color": statusColor }}
    >
      <div className="custom-title-bar">
        <div className="title-left">
          <img
            src={logoImg}
            className="mini-logo"
            style={{
              borderRadius: "6px",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          />
          <span className="window-title">Are You Alive?</span>
        </div>
      </div>

      <Lifeline history={history} />

      <div className="top-pills">
        <div className="pill glass">
          <GiAtomicSlashes color="#f59e0b" className="react-spin" size={20} />
          <span>{stats.streak} day streak</span>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="pill glass nebula-shimmer"
        >
          <BsShieldCheck color="#10b981" />
          <span>Active</span>
        </motion.div>
        <div className="pill glass">
          <span
            style={{ opacity: 0.6, fontSize: "0.7rem", marginRight: "4px" }}
          >
            LIFE
          </span>
          <span>{stats.lifeStreak} days</span>
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
            onClick={() => setShowCalendar(true)}
            title="Cosmic Calendar"
          >
            <BsCalendar4Week />
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
          <div
            className="pulse-circle"
            style={{ borderColor: "var(--aura-color)" }}
          />
          <div
            className="pulse-circle delay-1"
            style={{ borderColor: "var(--aura-color)" }}
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98, filter: "brightness(0.9)" }}
            className="heartbeat-btn"
            style={{
              boxShadow: `0 0 50px var(--aura-color)33`,
              borderColor: "var(--aura-color)",
              transition: "border-color 0.8s ease, box-shadow 0.8s ease",
            }}
            onClick={handleCheckIn}
          >
            <FiHeart size={40} className="heart-icon" />
            <span className="btn-main">I'm Alive</span>
            <span className="btn-sub">
              {stats.avgSentiment < -1 ? "Holding On" : "Confirm Pulse"}
            </span>
          </motion.button>
        </div>

        <AnimatePresence>
          {showCalendar && (
            <div className="calendar-modal">
              <div
                className="modal-backdrop"
                onClick={() => setShowCalendar(false)}
              />
              <CosmicCalendar
                history={history}
                onClose={() => setShowCalendar(false)}
              />
            </div>
          )}
        </AnimatePresence>

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

          <AnimatePresence>
            {isFocused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="zen-backdrop"
                onClick={() => setIsFocused(false)}
              />
            )}
          </AnimatePresence>

          <motion.div
            className={`thought-journal glass nebula-shimmer ${
              isFocused ? "focused" : ""
            }`}
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <BsFeather className="journal-icon" />
            <textarea
              placeholder={getDynamicPrompt()}
              className="journal-input"
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              onFocus={() => setIsFocused(true)}
              rows={isFocused ? 5 : 1}
            />
            <AnimatePresence>
              {(isFocused || thought.length > 0) && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.1, color: "#10b981" }}
                  whileTap={{ scale: 0.9 }}
                  className="journal-send-btn"
                  onClick={handleCheckIn}
                  title="Send to Cosmos"
                >
                  <BsSend size={18} />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
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
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.1);
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
          width: 320px;
          padding: 10px 20px;
          border-radius: 20px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 10;
          position: relative;
        }
        .thought-journal.focused {
          width: 600px;
          background: rgba(20, 20, 30, 0.8);
          border-color: var(--accent-primary);
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.2);
          transform: translateY(-20px);
          z-index: 1002;
        }
        .journal-icon {
          color: var(--text-secondary);
          opacity: 0.6;
          margin-top: 4px;
          transition: color 0.3s;
        }
        .thought-journal.focused .journal-icon {
          color: var(--accent-primary);
          opacity: 1;
        }
        .journal-input {
          background: transparent;
          border: none;
          color: white;
          flex: 1;
          outline: none;
          font-family: "Outfit", sans-serif;
          font-size: 1.1rem;
          line-height: 1.6;
          resize: none;
          text-align: left;
          min-height: 24px;
        }
        .journal-input::placeholder {
          font-family: "Inter", sans-serif;
          font-style: italic;
          opacity: 0.5;
          text-align: center;
        }
        .thought-journal.focused .journal-input::placeholder {
          text-align: left;
        }
        .journal-send-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          margin-top: 2px;
        }
        .react-spin {
          animation: spin-slow 10s linear infinite;
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .zen-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          z-index: 1001;
        }

        .calendar-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }
        .modal-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
        }
      `}</style>
    </motion.div>
  );
}

export default Dashboard;
