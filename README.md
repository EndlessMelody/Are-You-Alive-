<div align="center">

<img src="public/logo.jpg" alt="Are You Alive Logo" width="120" style="border-radius: 20px; border: 1px solid rgba(255,255,255,0.2)"/>

# Are You Alive?

**A Sentient Health & Safety Companion**

_The silent guardian that watches over your digital soul._

[![Built with Electron](https://img.shields.io/badge/Built%20with-Electron-47848F?logo=electron)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react)](https://reactjs.org/)
[![SQLite](https://img.shields.io/badge/Database-SQLite%203-003B57?logo=sqlite)](https://www.sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## About

**Are You Alive?** is a local-first, sentient monitoring system designed to verify your well-being through subtle interaction and pattern recognition. Unlike passive alarms, it acts as a "living" companion—tracking your life streak, analyzing your emotional pulse, and providing a safe space for deep reflection.

### Core Philosophy

In a world of constant noise, we often forget to check in with ourselves.

- **Sentinel Monitoring**: Tracks your activity to ensure you are safe and active.
- **Emotional Intelligence**: Adapts its prompts based on your sentiment analysis.
- **Privacy Core**: All data is encrypted locally using hardware-bound keys.

---

## Key Features

- **Atomic Streak**: Quantum-inspired life tracking powered by a perpetual motion engine.
- **Sentient Journal**: Immersive "Zen Mode" writing experience with auto-expanding glassmorphic UI.
- **Silent Guardian**: System tray integration that monitors activity without intrusion.
- **Cosmic Aesthetic**: High-fidelity glassmorphism with nebula shimmers and particle effects.
- **Fortress Security**: Hardware-backed encryption (`electron.safeStorage`) for all personal data.
- **Vitality Analytics**: Visual history of your moods, check-ins, and survival stats.

---

## Tech Stack

| Component    | Technology                                             |
| :----------- | :----------------------------------------------------- |
| **Core**     | Electron, Node.js                                      |
| **Frontend** | React 18, Vite, Framer Motion                          |
| **Styling**  | CSS Variables, Glassmorphism, React Icons              |
| **Database** | Better-SQLite3 (Local), Supabase (Optional Cloud Sync) |
| **Security** | Electron SafeStorage, AES-256                          |
| **Analysis** | Sentiment.js, Natural Language Processing              |

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18+) ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))

---

## Quick Start

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/EndlessMelody/Are-You-Alive-.git
   cd Are-You-Alive-
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the Sentinel**
   ```bash
   npm start
   ```

### Building for Production

To create a distributable installer for Windows:

```bash
npm run dist
```

---

## Project Structure

```
Are-You-Alive/
├── src/
│   ├── main/                    # Electron Main Process
│   │   ├── main.js             # Backend Core & Guardian Loop
│   │   └── preload.js          # Secure IPC Bridge
│   │
│   └── renderer/                # React Frontend
│       ├── components/          # UI Components (Dashboard, Journal, etc.)
│       └── assets/              # Static Assets
│
├── public/                      # Public Assets (Logo, Icons)
├── dist/                        # Build Artifacts
└── package.json
```

---

<div align="center">

**Created by [EndlessMelody](https://github.com/EndlessMelody)**

_Stay Alive. Stay Curious._

</div>
