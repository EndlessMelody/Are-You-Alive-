import React from "react";
import { motion } from "framer-motion";
import {
  BsEmojiSmile,
  BsEmojiNeutral,
  BsEmojiExpressionless,
  BsEmojiFrown,
  BsCloudFog2,
} from "react-icons/bs";

const moods = [
  { id: "happy", icon: BsEmojiSmile, label: "Happy", color: "#10b981" },
  { id: "neutral", icon: BsEmojiNeutral, label: "Neutral", color: "#3b82f6" },
  {
    id: "tired",
    icon: BsEmojiExpressionless,
    label: "Tired",
    color: "#f59e0b",
  },
  { id: "sad", icon: BsEmojiFrown, label: "Sad", color: "#ef4444" },
  { id: "empty", icon: BsCloudFog2, label: "Empty", color: "#94a3b8" },
];

function MoodSelector({ selectedMood, onSelect }) {
  return (
    <div className="mood-selector">
      <p className="mood-title">How are you today?</p>
      <div className="mood-options">
        {moods.map((m) => {
          const Icon = m.icon;
          const isActive = selectedMood === m.id;
          return (
            <motion.button
              key={m.id}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9, rotate: -5 }}
              className={`mood-btn ${isActive ? "active nebula-shimmer" : ""}`}
              onClick={() => onSelect(m.id)}
              title={m.label}
              type="button"
            >
              <Icon size={24} color={isActive ? m.color : "#94a3b8"} />
            </motion.button>
          );
        })}
      </div>
      <style jsx>{`
        .mood-selector {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .mood-title {
          font-size: 0.85rem;
          color: var(--text-secondary);
          opacity: 0.8;
          font-family: "Outfit", sans-serif;
        }
        .mood-options {
          display: flex;
          gap: 16px;
        }
        .mood-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mood-btn:hover {
          transform: scale(1.2);
          background: rgba(255, 255, 255, 0.05);
        }
        .mood-btn.active {
          transform: scale(1.1);
          background: rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  );
}

export default MoodSelector;
