import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { X, MessageCircle, Calendar as CalIcon, List } from "lucide-react";

function HistoryView({ onClose }) {
  const [history, setHistory] = useState([]);
  const [value, setValue] = useState(new Date());

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await window.electronAPI.getHistory();
    setHistory(data);
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const day = date.toISOString().split("T")[0];
      const hasCheckin = history.some((h) => h.timestamp.split("T")[0] === day);
      return hasCheckin ? "has-checkin" : null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="history-overlay"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="glass history-container nebula-shimmer"
      >
        <div className="history-header">
          <div className="header-title">
            <CalIcon size={20} color="#3b82f6" />
            <h2>Universal Log</h2>
          </div>
          <motion.button
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="close-btn"
            onClick={onClose}
          >
            <X size={24} />
          </motion.button>
        </div>

        <div className="history-content">
          <div className="calendar-section">
            <div className="glass-panel nebula-shimmer">
              <Calendar
                onChange={setValue}
                value={value}
                tileClassName={tileClassName}
              />
            </div>
          </div>

          <div className="logs-section">
            <div className="section-header">
              <List size={18} />
              <h3>Recent Pulses</h3>
            </div>
            <div className="logs-list">
              <AnimatePresence>
                {history.map((log, idx) => (
                  <motion.div
                    key={log.id}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{
                      scale: 1.01,
                      x: 10,
                      backgroundColor: "rgba(255,255,255,0.08)",
                    }}
                    whileTap={{ scale: 0.99 }}
                    className="log-item glass nebula-shimmer"
                  >
                    <div className="log-date">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                    {log.thought && (
                      <div className="log-thought">
                        <MessageCircle
                          size={14}
                          style={{ marginRight: "8px" }}
                        />
                        "{log.thought}"
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .history-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 40px;
        }
        .history-container {
          width: 100%;
          max-width: 1000px;
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid var(--border-glass);
        }
        .history-header {
          padding: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-glass);
        }
        .header-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .header-title h2 {
          font-size: 1.5rem;
          letter-spacing: -0.5px;
        }
        .close-btn {
          background: transparent;
          color: var(--text-secondary);
          border: none;
          cursor: pointer;
        }

        .history-content {
          flex: 1;
          display: flex;
          padding: 30px;
          gap: 30px;
          overflow: hidden;
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.02);
          padding: 20px;
          border-radius: 16px;
          border: 1px solid var(--border-glass);
        }

        .calendar-section {
          flex: 1.2;
        }
        .logs-section {
          flex: 1.5;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          color: var(--text-secondary);
        }
        .section-header h3 {
          font-size: 1.1rem;
          color: white;
        }

        .logs-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-right: 12px;
        }
        .log-item {
          padding: 16px 20px;
          border-radius: 16px;
          font-size: 0.9rem;
          transition: transform 0.2s;
        }
        .log-item:hover {
          transform: translateX(5px);
          background: rgba(255, 255, 255, 0.06);
        }
        .log-date {
          color: var(--accent-primary);
          font-weight: 600;
          margin-bottom: 6px;
          font-family: "Outfit";
        }
        .log-thought {
          color: var(--text-secondary);
          font-style: italic;
          display: flex;
          align-items: center;
          line-height: 1.4;
        }

        :global(.react-calendar) {
          background: transparent !important;
          border: none !important;
          color: white !important;
          font-family: "Outfit", sans-serif !important;
          width: 100% !important;
        }
        :global(.react-calendar__navigation) {
          margin-bottom: 20px !important;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 5px;
        }
        :global(.react-calendar__navigation button) {
          color: white !important;
          font-weight: 700 !important;
          font-size: 1rem !important;
          border-radius: 10px;
          min-width: 44px;
          background: transparent !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        :global(.react-calendar__navigation button:hover) {
          background: rgba(255, 255, 255, 0.08) !important;
          color: var(--accent-primary) !important;
        }
        :global(.react-calendar__month-view__weekdays__weekday) {
          color: var(--text-secondary) !important;
          text-decoration: none !important;
          font-weight: 700;
          font-size: 0.75rem;
          text-transform: uppercase;
          opacity: 0.5;
          padding: 10px 0;
        }
        :global(.react-calendar__tile) {
          color: white !important;
          border-radius: 12px !important;
          height: 54px !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 600;
          font-size: 0.9rem;
          background: transparent !important;
          border: 1px solid transparent !important;
        }
        :global(.react-calendar__tile:hover) {
          background: rgba(255, 255, 255, 0.08) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          transform: scale(1.05);
          z-index: 10;
        }
        :global(.react-calendar__tile--now) {
          background: rgba(59, 130, 246, 0.1) !important;
          color: var(--accent-primary) !important;
          border: 1px solid rgba(59, 130, 246, 0.3) !important;
        }
        :global(.react-calendar__tile--active) {
          background: linear-gradient(135deg, #3b82f6, #6366f1) !important;
          color: white !important;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
          border: none !important;
        }
        :global(.has-checkin) {
          color: #10b981 !important;
          position: relative;
        }
        :global(.has-checkin::before) {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(16, 185, 129, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        :global(.has-checkin::after) {
          content: "";
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 5px;
          height: 5px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 10px #10b981;
          animation: pulse-emerald 2s infinite ease-in-out;
        }
        @keyframes pulse-emerald {
          0% {
            box-shadow: 0 0 5px #10b981;
            opacity: 0.6;
          }
          50% {
            box-shadow: 0 0 15px #10b981;
            opacity: 1;
          }
          100% {
            box-shadow: 0 0 5px #10b981;
            opacity: 0.6;
          }
        }
      `}</style>
    </motion.div>
  );
}
export default HistoryView;
