const {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  Menu,
  nativeImage,
  safeStorage,
  Notification,
  powerMonitor,
} = require("electron");
const path = require("path");
const Database = require("better-sqlite3");
const nodemailer = require("nodemailer");
const { createClient } = require("@supabase/supabase-js");
const log = require("electron-log");
const Sentiment = require("sentiment");
const AutoLaunch = require("auto-launch");

// Configure Audit Logging
log.transports.file.level = "info";
log.transports.file.resolvePathFn = () =>
  path.join(app.getPath("userData"), "logs/audit.log");
log.info("System Boot: Are You Alive? Backend v3.1 (Sentient Edition)");

const dbPath = path.join(app.getPath("userData"), "database.sqlite");
const db = new Database(dbPath);
const sentiment = new Sentiment();

let transporter = null;
let supabase = null;
let tray = null;
let mainWindow = null;
let isQuitting = false;
let softPulseExtension = 0; // Extension in hours from activity

// Initialize AutoLaunch
const appLauncher = new AutoLaunch({
  name: "Are You Alive?",
  path: app.getPath("exe"),
});

function encrypt(text) {
  if (!text || !safeStorage.isEncryptionAvailable()) return null;
  return safeStorage.encryptString(text);
}

function decrypt(buffer) {
  if (!buffer || !safeStorage.isEncryptionAvailable()) return null;
  try {
    return safeStorage.decryptString(Buffer.from(buffer));
  } catch (e) {
    return null;
  }
}

/**
 * Migration & Initialization
 */
function initializeInfrastructure() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY,
      user_name TEXT,
      user_email TEXT,
      contact_name TEXT,
      contact_email TEXT,
      contact_phone TEXT,
      danger_threshold INTEGER DEFAULT 2,
      last_alert_sent TIMESTAMP,
      smtp_host TEXT,
      smtp_port INTEGER,
      smtp_user TEXT,
      smtp_pass BLOB,
      supabase_url TEXT,
      supabase_key BLOB,
      auto_start INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS check_ins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      thought TEXT,
      mood TEXT,
      sentiment_score INTEGER,
      sync_status TEXT DEFAULT 'pending'
    );

    CREATE TABLE IF NOT EXISTS streak (
      id INTEGER PRIMARY KEY,
      current_count INTEGER DEFAULT 0,
      last_checkin_date DATE
    );

    INSERT OR IGNORE INTO streak (id, current_count) VALUES (1, 0);
  `);

  const addColumn = (table, column, type) => {
    try {
      const info = db.prepare(`PRAGMA table_info(${table})`).all();
      if (!info.some((col) => col.name === column)) {
        db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`).run();
        log.info(`Migration: Added ${column} to ${table}`);
      }
    } catch (err) {
      log.error(`Migration Failed for ${table}.${column}:`, err);
    }
  };

  addColumn("profile", "danger_threshold", "INTEGER DEFAULT 2");
  addColumn("profile", "last_alert_sent", "TIMESTAMP");
  addColumn("profile", "smtp_host", "TEXT");
  addColumn("profile", "smtp_port", "INTEGER");
  addColumn("profile", "smtp_user", "TEXT");
  addColumn("profile", "smtp_pass", "BLOB");
  addColumn("profile", "supabase_url", "TEXT");
  addColumn("profile", "supabase_key", "BLOB");
  addColumn("profile", "auto_start", "INTEGER DEFAULT 0");
  addColumn("profile", "owner_birthday", "TEXT");
  addColumn("profile", "last_bday_noti", "TEXT");

  addColumn("check_ins", "timestamp", "DATETIME DEFAULT CURRENT_TIMESTAMP");
  addColumn("check_ins", "thought", "TEXT");
  addColumn("check_ins", "mood", "TEXT");
  addColumn("check_ins", "sentiment_score", "INTEGER");
  addColumn("check_ins", "sync_status", "TEXT DEFAULT 'pending'");
}

initializeInfrastructure();

/**
 * SMTP Engine
 */
function initSMTP(profile) {
  if (profile.smtp_host && profile.smtp_user && profile.smtp_pass) {
    const pass = decrypt(profile.smtp_pass);
    if (pass) {
      transporter = nodemailer.createTransport({
        host: profile.smtp_host,
        port: profile.smtp_port || 587,
        secure: profile.smtp_port === 465,
        auth: {
          user: profile.smtp_user,
          pass: pass,
        },
      });
      log.info(`SMTP Initialized: ${profile.smtp_host}`);
    }
  }
}

function initSupabase(profile) {
  if (profile.supabase_url && profile.supabase_key) {
    const key = decrypt(profile.supabase_key);
    if (key) supabase = createClient(profile.supabase_url, key);
  }
}

/**
 * UI & App Logic
 */
function createTray() {
  const iconPath = path.join(__dirname, "../../public/logo.jpg");
  let icon;
  try {
    icon = nativeImage.createFromPath(iconPath);
  } catch (e) {
    icon = nativeImage.createEmpty();
  }
  tray = new Tray(icon);
  tray.setToolTip("RUA Checkin");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: "Pulse Check",
        click: () => {
          if (mainWindow) mainWindow.show();
        },
      },
      { type: "separator" },
      {
        label: "Quit",
        click: () => {
          isQuitting = true;
          app.quit();
        },
      },
    ])
  );
  tray.on("double-click", () => {
    if (mainWindow) mainWindow.show();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 850,
    icon: path.join(__dirname, "../../public/logo.jpg"),
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#050508",
      symbolColor: "#94a3b8",
      height: 40,
    },
    frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    backgroundColor: "#050508",
    show: false,
  });
  if (process.env.VITE_DEV_SERVER_URL)
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  else mainWindow.loadFile(path.join(__dirname, "../../dist/index.html"));
  mainWindow.on("close", (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });
  mainWindow.once("ready-to-show", () => mainWindow.show());
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  // Activity Monitor (Soft Pulse)
  powerMonitor.on("unlock-screen", () => {
    softPulseExtension = 6; // Extend alert by 6 hours if user is active
    log.info("Soft Pulse Detected: Screen Unlocked");
  });

  const profile = db.prepare("SELECT * FROM profile WHERE id = 1").get();
  if (profile) {
    initSMTP(profile);
    initSupabase(profile);
    if (profile.auto_start) appLauncher.enable();
  }
});

/**
 * IPC Interaction
 */
ipcMain.handle("get-profile", () => {
  const p = db.prepare("SELECT * FROM profile WHERE id = 1").get();
  if (!p) return null;
  return {
    ...p,
    user_name: decrypt(p.user_name) || p.user_name,
    user_email: decrypt(p.user_email) || p.user_email,
    contact_name: decrypt(p.contact_name) || p.contact_name,
    contact_email: decrypt(p.contact_email) || p.contact_email,
    contact_phone: decrypt(p.contact_phone) || p.contact_phone,
    owner_birthday: decrypt(p.owner_birthday) || p.owner_birthday,
    hasSmtp: !!p.smtp_pass,
    hasSupabase: !!p.supabase_key,
  };
});

ipcMain.handle("save-profile", (event, data) => {
  const existing = db.prepare("SELECT id FROM profile WHERE id = 1").get();
  const encUser = encrypt(data.user_name);
  const encMail = encrypt(data.user_email);
  const encCName = encrypt(data.contact_name);
  const encCMail = encrypt(data.contact_email);
  const encCPhone = encrypt(data.contact_phone);
  const encBday = encrypt(data.owner_birthday);
  const encryptedSmtp = data.smtp_pass ? encrypt(data.smtp_pass) : null;
  const encryptedSupa = data.supabase_key ? encrypt(data.supabase_key) : null;

  const sql = existing
    ? `UPDATE profile SET user_name=?, user_email=?, contact_name=?, contact_email=?, contact_phone=?, danger_threshold=?, smtp_host=?, smtp_port=?, smtp_user=?, smtp_pass=COALESCE(?, smtp_pass), supabase_url=?, supabase_key=COALESCE(?, supabase_key), auto_start=?, owner_birthday=? WHERE id=1`
    : `INSERT INTO profile (id, user_name, user_email, contact_name, contact_email, contact_phone, danger_threshold, smtp_host, smtp_port, smtp_user, smtp_pass, supabase_url, supabase_key, auto_start, owner_birthday) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const params = [
    encUser,
    encMail,
    encCName,
    encCMail,
    encCPhone,
    data.danger_threshold,
    data.smtp_host,
    data.smtp_port,
    data.smtp_user,
    encryptedSmtp,
    data.supabase_url,
    encryptedSupa,
    data.auto_start ? 1 : 0,
    encBday,
  ];

  db.prepare(sql).run(...params);
  log.info(`Profile Securely Updated: ${data.user_name}`);

  const fresh = db.prepare("SELECT * FROM profile WHERE id = 1").get();
  initSMTP(fresh);
  initSupabase(fresh);
  if (data.auto_start) appLauncher.enable();
  else appLauncher.disable();
  return { success: true };
});

ipcMain.handle("check-in", async (event, data) => {
  const { thought, mood } = data || {};
  const analysis = sentiment.analyze(thought || "");
  const now = new Date().toISOString();
  const encryptedThought = encrypt(thought || "");

  const result = db
    .prepare(
      "INSERT INTO check_ins (timestamp, thought, mood, sentiment_score) VALUES (?, ?, ?, ?)"
    )
    .run(now, encryptedThought, mood || "", analysis.score);

  if (supabase) {
    supabase
      .from("check_ins")
      .insert([
        {
          timestamp: now,
          thought: encryptedThought ? encryptedThought.toString("base64") : "",
          mood,
          sentiment_score: analysis.score,
        },
      ])
      .then((res) => {
        if (!res.error)
          db.prepare(
            'UPDATE check_ins SET sync_status="synced" WHERE id=?'
          ).run(result.lastInsertRowid);
      });
  }

  const today = now.split("T")[0];
  const streak = db.prepare("SELECT * FROM streak WHERE id = 1").get();
  let newCount = streak ? streak.current_count : 0;
  if (!streak || streak.last_checkin_date !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    newCount =
      streak && streak.last_checkin_date === yesterdayStr ? newCount + 1 : 1;
    db.prepare(
      "UPDATE streak SET current_count=?, last_checkin_date=? WHERE id=1"
    ).run(newCount, today);
  }
  softPulseExtension = 0; // Reset soft pulse on hard check-in
  return { success: true, count: newCount };
});

ipcMain.handle("get-stats", () => {
  try {
    const streak = db
      .prepare("SELECT current_count FROM streak WHERE id = 1")
      .get();
    const lastCheckin = db
      .prepare(
        "SELECT timestamp FROM check_ins ORDER BY timestamp DESC LIMIT 1"
      )
      .get();
    const profile = db
      .prepare(
        "SELECT danger_threshold, owner_birthday FROM profile WHERE id = 1"
      )
      .get();

    let warningActive = false,
      timeRemaining = null,
      lifeStreak = 0;

    if (profile && profile.owner_birthday) {
      const bdayStr = decrypt(profile.owner_birthday);
      if (bdayStr) {
        const bday = new Date(bdayStr);
        lifeStreak = Math.floor((new Date() - bday) / (1000 * 60 * 60 * 24));
      }
    }

    const recent = db
      .prepare(
        "SELECT sentiment_score FROM check_ins ORDER BY timestamp DESC LIMIT 7"
      )
      .all();
    const avgSentiment =
      recent.length > 0
        ? recent.reduce((a, b) => a + (b.sentiment_score || 0), 0) /
          recent.length
        : 0;

    if (lastCheckin && profile) {
      const lastDate = new Date(lastCheckin.timestamp),
        now = new Date();
      const diffHours = (now - lastDate) / (1000 * 60 * 60);

      // Adaptive Threshold Logic
      let thresholdHours = profile.danger_threshold * 24;
      if (avgSentiment < -1) thresholdHours *= 0.5; // Tighten threshold if user is down

      if (diffHours >= thresholdHours) {
        warningActive = true;
        timeRemaining = Math.max(
          0,
          new Date(
            lastDate.getTime() +
              (thresholdHours + 12 + softPulseExtension) * 60 * 60 * 1000
          ) - now
        );
      }
    }

    return {
      streak: streak ? streak.current_count : 0,
      lifeStreak,
      avgSentiment,
      recentCheckins: recent.length,
      lastCheckin: lastCheckin ? lastCheckin.timestamp : null,
      warningActive,
      timeRemaining,
    };
  } catch (err) {
    log.error("get-stats failed:", err);
    throw err;
  }
});

ipcMain.handle("get-history", () => {
  const rows = db
    .prepare("SELECT * FROM check_ins ORDER BY timestamp DESC LIMIT 100")
    .all();
  return rows.map((r) => ({
    ...r,
    thought: decrypt(r.thought) || r.thought,
  }));
});

ipcMain.handle("get-db-health", () => {
  try {
    const integrity = db.prepare("PRAGMA integrity_check").get();
    const stats = require("fs").statSync(dbPath);
    return {
      status: integrity.integrity_check === "ok" ? "healthy" : "corrupted",
      size: (stats.size / 1024 / 1024).toFixed(2) + " MB",
      path: dbPath,
    };
  } catch (err) {
    return { status: "error", message: err.message };
  }
});

ipcMain.handle("rebuild-db", () => {
  try {
    db.prepare("VACUUM").run();
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message };
  }
});

/**
 * Custom Alert Engine
 */
async function guardianLoop() {
  const profile = db.prepare("SELECT * FROM profile WHERE id = 1").get();
  if (!profile) return;

  const lastCheckin = db
    .prepare("SELECT timestamp FROM check_ins ORDER BY timestamp DESC LIMIT 1")
    .get();
  if (!lastCheckin) return;

  const lastDate = new Date(lastCheckin.timestamp),
    now = new Date();

  // Birthday Alert
  if (profile.owner_birthday) {
    const bdayStr = decrypt(profile.owner_birthday);
    if (bdayStr) {
      const bday = new Date(bdayStr);
      if (
        bday.getMonth() === now.getMonth() &&
        bday.getDate() === now.getDate()
      ) {
        const lastBdayNoti = profile.last_bday_noti
          ? new Date(profile.last_bday_noti)
          : null;
        if (!lastBdayNoti || lastBdayNoti.getFullYear() < now.getFullYear()) {
          new Notification({
            title: "Happy Birthday!",
            body: "Wishing you a bright year in the cosmos. Stay alive, stay curious.",
          }).show();
          db.prepare("UPDATE profile SET last_bday_noti=? WHERE id=1").run(
            now.toISOString()
          );
        }
      }
    }
  }

  const diffHours = (now - lastDate) / (1000 * 60 * 60);

  // Sentiment Trend for Guardian
  const recent = db
    .prepare(
      "SELECT sentiment_score FROM check_ins ORDER BY timestamp DESC LIMIT 5"
    )
    .all();
  const avgSentiment =
    recent.length > 0
      ? recent.reduce((a, b) => a + (b.sentiment_score || 0), 0) / recent.length
      : 0;

  let threshold = profile.danger_threshold * 24;
  if (avgSentiment < -1) threshold *= 0.5; // Tighter safety window if user is in a low period

  if (diffHours >= threshold + softPulseExtension) {
    const elapsedSinceDanger = diffHours - (threshold + softPulseExtension);
    if (elapsedSinceDanger < 1) {
      new Notification({
        title: "Are You Alive?",
        body: "Pulse check required. Silent escalation starting soon.",
      }).show();
    }
    if (elapsedSinceDanger >= 1) {
      const lastAlert = profile.last_alert_sent
        ? new Date(profile.last_alert_sent)
        : null;
      const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
      if (!lastAlert || lastAlert < twelveHoursAgo) {
        await sendEmergencyAlert(profile);
        db.prepare("UPDATE profile SET last_alert_sent=? WHERE id=1").run(
          now.toISOString()
        );
      }
    }
  }
}

async function sendEmergencyAlert(profile) {
  if (!transporter) {
    log.error("Alert Failed: SMTP not configured");
    return;
  }

  const userName = decrypt(profile.user_name) || profile.user_name;
  const contactEmail = decrypt(profile.contact_email) || profile.contact_email;

  const htmlTemplate = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0c0d10; color: #ffffff; padding: 40px; border-radius: 20px; border: 1px solid #1f2128;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #ef4444; font-size: 28px; letter-spacing: -0.5px; margin: 0;">EMERGENCY PULSE ALERT</h1>
        <p style="color: #94a3b8; font-size: 14px; margin: 4px 0;">Designated System Guardian</p>
      </div>
      <div style="background-color: #16181d; padding: 30px; border-radius: 16px; margin-bottom: 30px;">
        <p style="font-size: 16px; line-height: 1.6; margin: 0;">
          This is an automated alert regarding <strong>${userName}</strong>. 
          The "Are You Alive?" system has detected silence for over <strong>${profile.danger_threshold} days</strong>.
        </p>
      </div>
      <div style="border-top: 1px solid #1f2128; padding-top: 20px; text-align: center;">
        <p style="color: #94a3b8; font-size: 14px;">Please attempt to contact them directly.</p>
        <div style="margin-top: 20px; font-size: 12px; color: #475569;">
          Secure Protocol v3.1 | Local Pulse Monitor
        </div>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Are You Alive Guardian" <${profile.smtp_user}>`,
      to: contactEmail,
      subject: `CRITICAL ALERT: ${userName} Initializing Emergency Protocol`,
      html: htmlTemplate,
    });
    log.info("Alert Sent Successfully via Custom SMTP");
  } catch (err) {
    log.error("Alert Delivery Failed:", err);
  }
}

setInterval(guardianLoop, 15 * 60 * 1000);
setTimeout(guardianLoop, 5000);
