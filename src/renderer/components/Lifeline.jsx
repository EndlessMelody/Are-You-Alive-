import React from "react";
import { motion } from "framer-motion";
import { FiCheck, FiAlertCircle, FiX } from "react-icons/fi";

function Lifeline({ history }) {
  // Take last 5 days
  const displayHistory = history.slice(0, 5).reverse();

  return (
    <div className="lifeline-panel glass">
      <div className="lifeline-header">
        <h3>Pulse History</h3>
      </div>
      <div className="lifeline-track">
        {displayHistory.map((item, idx) => {
          const date = new Date(item.timestamp);
          const isToday = new Date().toDateString() === date.toDateString();

          return (
            <div key={item.id} className="lifeline-item">
              <div className="lifeline-marker">
                <FiCheck size={14} color="#10b981" />
                {idx < displayHistory.length - 1 && (
                  <div className="lifeline-connector" />
                )}
              </div>
              <div className="lifeline-info">
                <span className="lifeline-date">
                  {isToday
                    ? "Today"
                    : date.toLocaleDateString(undefined, { weekday: "short" })}
                </span>
                <span className="lifeline-status">Pulse Detected</span>
              </div>
            </div>
          );
        })}
        {displayHistory.length === 0 && (
          <p className="empty-text">No pulses recorded yet.</p>
        )}
      </div>
      <style jsx>{`
        .lifeline-panel {
          position: fixed;
          left: 40px;
          top: 50%;
          transform: translateY(-50%);
          width: 200px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          z-index: 10;
        }
        .lifeline-header h3 {
          font-size: 0.9rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .lifeline-track {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .lifeline-item {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .lifeline-marker {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }
        .lifeline-connector {
          width: 2px;
          height: 24px;
          background: rgba(255, 255, 255, 0.1);
          margin-top: 4px;
        }
        .lifeline-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .lifeline-date {
          font-size: 0.85rem;
          font-weight: 600;
          color: white;
        }
        .lifeline-status {
          font-size: 0.7rem;
          color: var(--text-secondary);
        }
        .empty-text {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-style: italic;
        }
      `}</style>
    </div>
  );
}

export default Lifeline;
