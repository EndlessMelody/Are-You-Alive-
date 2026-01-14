import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BsCalendar4Week, BsX } from "react-icons/bs";

function CosmicCalendar({ history, onClose }) {
  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    // Generate last 35 days for the grid
    const today = new Date();
    const grid = [];
    for (let i = 34; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const entry = history.find((h) => h.timestamp.startsWith(dateStr));
      grid.push({
        date: d,
        dateStr,
        entry,
      });
    }
    setDays(grid);
  }, [history]);

  const getMoodColor = (mood) => {
    switch (mood) {
      case "happy":
        return "#10b981";
      case "neutral":
        return "#3b82f6";
      case "sad":
        return "#6366f1";
      case "stressed":
        return "#f59e0b";
      case "anxious":
        return "#ef4444";
      default:
        return "rgba(255,255,255,0.05)";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
      },
    },
  };

  const itemVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="cosmic-calendar glass nebula-shimmer"
    >
      <div className="calendar-header">
        <h3>
          <BsCalendar4Week /> Cosmic Lifeline
        </h3>
        <button className="close-btn" onClick={onClose}>
          <BsX size={24} />
        </button>
      </div>

      <motion.div
        className="calendar-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {days.map((day, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            whileHover={{ scale: 1.1, zIndex: 10 }}
            whileTap={{ scale: 0.95 }}
            className="calendar-day"
            style={{
              background: day.entry
                ? getMoodColor(day.entry.mood)
                : "rgba(255,255,255,0.02)",
              boxShadow: day.entry
                ? `0 0 15px ${getMoodColor(day.entry.mood)}44`
                : "none",
              border:
                day.date.toDateString() === new Date().toDateString()
                  ? "2px solid white"
                  : "1px solid rgba(255,255,255,0.05)",
            }}
            onClick={() => setSelectedDay(day)}
          >
            <span className="day-num">{day.date.getDate()}</span>
          </motion.div>
        ))}
      </motion.div>

      <div className="day-details">
        {selectedDay ? (
          <div className="details-content">
            <h4>
              {selectedDay.date.toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </h4>
            {selectedDay.entry ? (
              <>
                <div
                  className="detail-tag"
                  style={{
                    background: getMoodColor(selectedDay.entry.mood) + "22",
                    color: getMoodColor(selectedDay.entry.mood),
                  }}
                >
                  Mood: {selectedDay.entry.mood}
                </div>
                <p className="detail-thought">
                  "{selectedDay.entry.thought || "A silent pulse..."}"
                </p>
              </>
            ) : (
              <p className="no-entry">No heartbeat recorded this day.</p>
            )}
          </div>
        ) : (
          <div className="details-placeholder">
            Select a day to view its pulse
          </div>
        )}
      </div>

      <style jsx>{`
        .cosmic-calendar {
          width: 500px;
          height: 600px;
          padding: 30px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          position: relative;
        }
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .calendar-header h3 {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: "Outfit";
          font-size: 1.2rem;
          margin: 0;
        }
        .close-btn {
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          opacity: 0.6;
        }
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 10px;
          background: rgba(0, 0, 0, 0.2);
          padding: 15px;
          border-radius: 16px;
        }
        .calendar-day {
          aspect-ratio: 1;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .day-num {
          font-size: 0.7rem;
          font-weight: 700;
          opacity: 0.5;
        }
        .day-details {
          flex: 1;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .details-content h4 {
          margin: 0 0 12px 0;
          font-family: "Outfit";
          color: white;
        }
        .detail-tag {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .detail-thought {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
          max-width: 300px;
          font-style: italic;
        }
        .details-placeholder,
        .no-entry {
          color: var(--text-secondary);
          font-size: 0.9rem;
          opacity: 0.5;
        }
      `}</style>
    </motion.div>
  );
}

export default CosmicCalendar;
