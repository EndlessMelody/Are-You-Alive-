import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsShieldLock,
  BsPerson,
  BsEnvelope,
  BsClockHistory,
  BsCloudArrowUp,
  BsServer,
  BsGear,
  BsPower,
  BsCheck2Circle,
  BsShieldCheck,
} from "react-icons/bs";
import { FiUser, FiBell, FiServer, FiActivity } from "react-icons/fi";

const TABS = [
  { id: "identity", label: "Identity", icon: FiUser },
  { id: "guardian", label: "Guardian", icon: FiBell },
  { id: "cosmos", label: "Cosmos", icon: FiServer },
  { id: "engine", label: "Engine", icon: FiActivity },
];

function Onboarding({ onComplete }) {
  const [activeTab, setActiveTab] = useState("identity");
  const [formData, setFormData] = useState({
    user_name: "",
    user_email: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    danger_threshold: 1,
    smtp_host: "",
    smtp_port: 587,
    smtp_user: "",
    smtp_pass: "",
    supabase_url: "",
    supabase_key: "",
    auto_start: true,
  });

  useEffect(() => {
    const fetch = async () => {
      const existing = await window.electronAPI.getProfile();
      if (existing)
        setFormData((p) => ({
          ...p,
          ...existing,
          auto_start: existing.auto_start === 1,
        }));
    };
    fetch();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await window.electronAPI.saveProfile(formData);
    onComplete();
  };

  return (
    <div className="settings-screen">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass settings-container"
      >
        <div className="settings-sidebar">
          <div className="sidebar-header">
            <img src="../../assets/icon.png" className="app-logo" />
            <span>Guardian v3</span>
          </div>
          <div className="sidebar-nav">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div layoutId="nav-glow" className="nav-glow" />
                )}
              </button>
            ))}
          </div>
          <button className="quit-btn" onClick={() => window.close()}>
            <BsPower size={18} />
            <span>Exit System</span>
          </button>
        </div>

        <div className="settings-content">
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="tab-panel"
              >
                {activeTab === "identity" && (
                  <div className="section">
                    <h2>
                      <BsPerson /> Personal Identity
                    </h2>
                    <div className="input-group">
                      <label>What should we call you?</label>
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={formData.user_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            user_name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label>Your Contact Email</label>
                      <input
                        type="email"
                        placeholder="you@nebula.com"
                        value={formData.user_email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            user_email: e.target.value,
                          })
                        }
                      />
                    </div>

                    <h2 style={{ marginTop: "40px" }}>
                      <BsEnvelope /> Emergency Recipient
                    </h2>
                    <div className="input-group">
                      <label>Who receives the alert?</label>
                      <input
                        type="text"
                        placeholder="Contact Name"
                        value={formData.contact_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contact_name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label>Recipient Mailbox</label>
                      <input
                        type="email"
                        placeholder="contact@galaxy.com"
                        value={formData.contact_email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contact_email: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                )}

                {activeTab === "guardian" && (
                  <div className="section">
                    <h2>
                      <BsServer /> Alert Protocol (SMTP)
                    </h2>
                    <p className="description">
                      Configure your private mail server to send emergency
                      alerts.
                    </p>
                    <div className="row">
                      <div className="input-group" style={{ flex: 3 }}>
                        <label>SMTP Host</label>
                        <input
                          type="text"
                          placeholder="smtp.gmail.com"
                          value={formData.smtp_host}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              smtp_host: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="input-group" style={{ flex: 1 }}>
                        <label>Port</label>
                        <input
                          type="number"
                          value={formData.smtp_port}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              smtp_port: parseInt(e.target.value) || 587,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="input-group">
                      <label>Username / Email</label>
                      <input
                        type="text"
                        placeholder="user@gmail.com"
                        value={formData.smtp_user}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            smtp_user: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="input-group">
                      <label>Password / App Password</label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        value={formData.smtp_pass}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            smtp_pass: e.target.value,
                          })
                        }
                      />
                    </div>

                    <h2 style={{ marginTop: "40px" }}>
                      <BsClockHistory /> Safety Window
                    </h2>
                    <div className="input-group">
                      <label>Alert after how many days of silence?</label>
                      <input
                        type="number"
                        value={formData.danger_threshold}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            danger_threshold: parseInt(e.target.value) || 1,
                          })
                        }
                        min="1"
                      />
                    </div>
                  </div>
                )}

                {activeTab === "cosmos" && (
                  <div className="section">
                    <h2>
                      <BsCloudArrowUp /> Supabase Sync
                    </h2>
                    <p className="description">
                      Mirror your heartbeats to the cloud for multi-device
                      resilience.
                    </p>
                    <div className="input-group">
                      <label>Project URL</label>
                      <input
                        type="text"
                        placeholder="https://xyz.supabase.co"
                        value={formData.supabase_url}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            supabase_url: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="input-group">
                      <label>Anon/Secret Key</label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        value={formData.supabase_key}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            supabase_key: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                {activeTab === "engine" && (
                  <div className="section">
                    <h2>
                      <BsGear /> System Behavior
                    </h2>
                    <div className="toggle-row">
                      <div className="toggle-info">
                        <h3>Auto-Launch</h3>
                        <p>Start Guardian when Windows boots up.</p>
                      </div>
                      <input
                        type="checkbox"
                        className="ios-toggle"
                        checked={formData.auto_start}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            auto_start: e.target.checked,
                          })
                        }
                      />
                    </div>

                    <div className="about-box glass">
                      <h3>Guardian Intelligence</h3>
                      <p>Version 3.0.0 (Armored Edition)</p>
                      <p>Hardware Encryption: Active</p>
                      <p>Security Policy: Strict-CSP</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="content-footer">
              <button type="submit" className="save-btn">
                <BsCheck2Circle size={18} />
                <span>Save Protocol</span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>

      <style jsx>{`
        .settings-screen {
          height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: rgba(0, 0, 0, 0.5);
        }
        .settings-container {
          width: 900px;
          height: 650px;
          display: flex;
          overflow: hidden;
          border-radius: 24px;
        }

        /* Sidebar */
        .settings-sidebar {
          width: 250px;
          border-right: 1px solid var(--border-glass);
          padding: 30px 20px;
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.01);
        }
        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 40px;
          padding-left: 10px;
        }
        .app-logo {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          object-fit: cover;
        }
        .sidebar-header span {
          font-family: "Outfit";
          font-weight: 700;
          font-size: 1.2rem;
        }
        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .nav-item {
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          color: var(--text-secondary);
          cursor: pointer;
          border-radius: 12px;
          font-family: "Inter";
          font-weight: 500;
          position: relative;
          transition: color 0.3s;
        }
        .nav-item.active {
          color: white;
        }
        .nav-item:hover {
          color: white;
          background: rgba(255, 255, 255, 0.03);
        }
        .nav-glow {
          position: absolute;
          left: 0;
          top: 0;
          right: 0;
          bottom: 0;
          background: rgba(59, 130, 246, 0.1);
          border-left: 3px solid var(--accent-primary);
          border-radius: 12px;
          z-index: -1;
        }
        .quit-btn {
          margin-top: auto;
          background: rgba(239, 68, 68, 0.1);
          border: none;
          color: #ef4444;
          padding: 12px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          font-weight: 600;
        }

        /* Content */
        .settings-content {
          flex: 1;
          background: rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
        }
        form {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .tab-panel {
          flex: 1;
          padding: 40px;
          overflow-y: auto;
        }
        .section h2 {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: "Outfit";
          font-size: 1.3rem;
          margin-bottom: 24px;
        }
        .description {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 24px;
        }
        .input-group {
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .input-group label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .row {
          display: flex;
          gap: 20px;
        }

        input {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          padding: 14px 16px;
          color: white;
          font-family: "Inter";
          font-size: 0.95rem;
          transition: all 0.3s;
        }
        input:focus {
          border-color: var(--accent-primary);
          background: rgba(255, 255, 255, 0.06);
          outline: none;
        }

        .toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 16px;
          border: 1px solid var(--border-glass);
        }
        .toggle-info h3 {
          font-size: 1rem;
          margin-bottom: 4px;
        }
        .toggle-info p {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .about-box {
          margin-top: 30px;
          padding: 24px;
          text-align: center;
        }
        .about-box h3 {
          font-size: 0.9rem;
          color: var(--accent-primary);
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .about-box p {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }

        .content-footer {
          padding: 30px 40px;
          border-top: 1px solid var(--border-glass);
          display: flex;
          justify-content: flex-end;
          background: rgba(255, 255, 255, 0.01);
        }
        .save-btn {
          background: var(--accent-primary);
          color: white;
          border: none;
          padding: 14px 30px;
          border-radius: 14px;
          font-family: "Outfit";
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.3s;
        }
        .save-btn:hover {
          filter: brightness(1.1);
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
        }

        /* Custom Checkbox as Toggle */
        .ios-toggle {
          appearance: none;
          width: 50px;
          height: 26px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          position: relative;
          cursor: pointer;
          transition: background 0.3s;
        }
        .ios-toggle:checked {
          background: var(--accent-primary);
        }
        .ios-toggle::after {
          content: "";
          position: absolute;
          top: 3px;
          left: 3px;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          transition: transform 0.3s;
        }
        .ios-toggle:checked::after {
          transform: translateX(24px);
        }

        ::-webkit-scrollbar {
          width: 5px;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

export default Onboarding;
