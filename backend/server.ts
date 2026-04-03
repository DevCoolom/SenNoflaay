import express from "express";
import "dotenv/config";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite Database
const db = new Database("database.sqlite");
db.pragma("journal_mode = WAL");

// Create Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS associations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    association_id TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    city TEXT,
    fee REAL DEFAULT 0,
    joined_date TEXT,
    gender TEXT, -- 'male' or 'female'
    is_minor BOOLEAN DEFAULT 0,
    linked_member_id TEXT,
    linked_person_name TEXT,
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    association_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    objective_id TEXT,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    method TEXT,
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS objectives (
    id TEXT PRIMARY KEY,
    association_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    target REAL NOT NULL,
    color TEXT,
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    association_id TEXT NOT NULL,
    objective_id TEXT,
    category TEXT,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE,
    FOREIGN KEY (objective_id) REFERENCES objectives(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    association_id TEXT NOT NULL,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT,
    location TEXT,
    speaker TEXT,
    description TEXT,
    book_id TEXT,
    participants INTEGER DEFAULT 0,
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS bills (
    id TEXT PRIMARY KEY,
    association_id TEXT NOT NULL,
    title TEXT NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    category TEXT,
    file_url TEXT,
    file_name TEXT,
    description TEXT,
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS corrections (
    association_id TEXT NOT NULL,
    year INTEGER NOT NULL,
    amount REAL NOT NULL,
    reason TEXT,
    PRIMARY KEY (association_id, year),
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS users (
    username TEXT NOT NULL,
    association_id TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    PRIMARY KEY (username, association_id),
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    association_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS settings (
    association_id TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT,
    PRIMARY KEY (association_id, key),
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    association_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo',
    priority INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS membership_fee_configs (
    association_id TEXT PRIMARY KEY,
    frequency TEXT NOT NULL DEFAULT 'yearly',
    period TEXT NOT NULL DEFAULT 'yearly',
    amount_all REAL DEFAULT 0,
    amount_male REAL DEFAULT 0,
    amount_female REAL DEFAULT 0,
    amount_minor REAL DEFAULT 0,
    use_categories BOOLEAN DEFAULT 0,
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE
  );
`);

// Migration: Ensure association_id exists and PKs are correct
const tablesToMigrate = [
  'members', 'payments', 'objectives', 'expenses', 'events', 
  'bills', 'corrections', 'users', 'audit_logs', 'settings', 'tasks', 'membership_fee_configs'
];

for (const table of tablesToMigrate) {
  try {
    const columns = db.pragma(`table_info(${table})`) as any[];
    if (columns.length === 0) {
      console.log(`Table ${table} does not exist yet.`);
      continue;
    }

    let needsMigration = false;
    let expectedPk: string[] = [];

    if (table === 'members') {
      needsMigration = columns.some(c => c.name === 'name');
    } else if (table === 'expenses') {
      if (!columns.some(c => c.name === 'category')) {
        db.exec("ALTER TABLE expenses ADD COLUMN category TEXT");
      }
    } else if (table === 'membership_fee_configs') {
      if (!columns.some(c => c.name === 'period')) {
        db.exec("ALTER TABLE membership_fee_configs ADD COLUMN period TEXT DEFAULT 'yearly'");
      }
    }

    const hasAssocId = columns.some(c => c.name === 'association_id');
    const pkColumns = columns.filter(c => c.pk > 0);
    
    console.log(`Checking table ${table}: hasAssocId=${hasAssocId}, pkColumns=[${pkColumns.map(c => c.name).join(', ')}]`);

    if (table === 'settings') {
      expectedPk = ['association_id', 'key'];
      const hasCorrectPk = pkColumns.length === 2 && expectedPk.every(name => pkColumns.some(c => c.name === name));
      
      // Also check for any unique index on 'key' alone or any index that doesn't include association_id
      const indexes = db.pragma(`index_list(${table})`) as any[];
      let hasWrongUniqueIndex = false;
      for (const idx of indexes) {
        if (idx.unique) {
          const idxInfo = db.pragma(`index_info(${idx.name})`) as any[];
          // If it's a unique index on just 'key', it's wrong
          if (idxInfo.length === 1 && idxInfo[0].name === 'key') {
            hasWrongUniqueIndex = true;
            break;
          }
          // If it's a unique index that doesn't include association_id, it's probably wrong for our multi-tenant setup
          if (!idxInfo.some(col => col.name === 'association_id')) {
            hasWrongUniqueIndex = true;
            break;
          }
        }
      }
      
      needsMigration = !hasCorrectPk || hasWrongUniqueIndex;
    } else if (table === 'users') {
      expectedPk = ['username', 'association_id'];
      const hasCorrectPk = pkColumns.length === 2 && expectedPk.every(name => pkColumns.some(c => c.name === name));
      
      // Also check for any unique index on 'username' alone
      const indexes = db.pragma(`index_list(${table})`) as any[];
      let hasWrongUniqueIndex = false;
      for (const idx of indexes) {
        if (idx.unique) {
          const idxInfo = db.pragma(`index_info(${idx.name})`) as any[];
          if (idxInfo.length === 1 && idxInfo[0].name === 'username') {
            hasWrongUniqueIndex = true;
            break;
          }
          if (!idxInfo.some(col => col.name === 'association_id')) {
            hasWrongUniqueIndex = true;
            break;
          }
        }
      }
      
      needsMigration = !hasCorrectPk || hasWrongUniqueIndex;
    } else if (table === 'corrections') {
      expectedPk = ['association_id', 'year'];
      needsMigration = pkColumns.length !== 2 || !expectedPk.every(name => pkColumns.some(c => c.name === name));
    } else if (!hasAssocId) {
      needsMigration = true;
    }

    if (needsMigration) {
      console.log(`Migrating table ${table} to new schema...`);
      if (table === 'settings' || table === 'users' || table === 'corrections' || table === 'members') {
        db.transaction(() => {
          const tempName = `${table}_migration_temp`;
          if (table === 'settings') {
            db.prepare(`
              CREATE TABLE ${tempName} (
                association_id TEXT NOT NULL,
                key TEXT NOT NULL,
                value TEXT,
                PRIMARY KEY (association_id, key),
                FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE
              )
            `).run();
          } else if (table === 'users') {
            db.prepare(`
              CREATE TABLE ${tempName} (
                username TEXT NOT NULL,
                association_id TEXT NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                PRIMARY KEY (username, association_id),
                FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE
              )
            `).run();
          } else if (table === 'corrections') {
            db.prepare(`
              CREATE TABLE ${tempName} (
                association_id TEXT NOT NULL,
                year INTEGER NOT NULL,
                amount REAL NOT NULL,
                reason TEXT,
                PRIMARY KEY (association_id, year),
                FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE
              )
            `).run();
          } else if (table === 'members') {
            db.prepare(`
              CREATE TABLE ${tempName} (
                id TEXT PRIMARY KEY,
                association_id TEXT NOT NULL,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                phone TEXT,
                city TEXT,
                fee REAL DEFAULT 0,
                joined_date TEXT,
                gender TEXT,
                is_minor BOOLEAN DEFAULT 0,
                linked_member_id TEXT,
                linked_person_name TEXT,
                FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE
              )
            `).run();
          }

          // Copy data
          if (table === 'members') {
            const rows = db.prepare(`SELECT * FROM ${table}`).all() as any[];
            for (const row of rows) {
              let firstName = row.first_name || '';
              let lastName = row.last_name || '';
              
              if (row.name && (!firstName || !lastName)) {
                const parts = row.name.trim().split(/\s+/);
                firstName = parts[0] || '';
                lastName = parts.slice(1).join(' ') || '';
              }
              
              db.prepare(`
                INSERT INTO ${tempName} (
                  id, association_id, first_name, last_name, phone, city, fee, 
                  joined_date, gender, is_minor, linked_member_id, linked_person_name
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `).run(
                row.id, 
                row.association_id || 'default-assoc', 
                firstName, 
                lastName, 
                row.phone || row.tel || null,
                row.city || null, 
                row.fee || 0, 
                row.joined_date || null, 
                row.gender || null, 
                row.is_minor || 0,
                row.linked_member_id || null,
                row.linked_person_name || null
              );
            }
          } else {
            const existingCols = columns.map(c => c.name);
            const targetCols = table === 'settings' ? ['association_id', 'key', 'value'] : 
                              table === 'users' ? ['username', 'association_id', 'password', 'role'] :
                              ['association_id', 'year', 'amount', 'reason'];
            
            const commonCols = targetCols.filter(c => existingCols.includes(c));
            const selectSource = targetCols.map(c => {
              if (existingCols.includes(c)) return c;
              if (c === 'association_id') return "'default-assoc'";
              return "NULL";
            }).join(', ');

            db.prepare(`INSERT OR REPLACE INTO ${tempName} (${targetCols.join(', ')}) SELECT ${selectSource} FROM ${table}`).run();
          }
          
          db.prepare(`DROP TABLE ${table}`).run();
          db.prepare(`ALTER TABLE ${tempName} RENAME TO ${table}`).run();
        })();
      } else {
        db.prepare(`ALTER TABLE ${table} ADD COLUMN association_id TEXT`).run();
        db.prepare(`UPDATE ${table} SET association_id = 'default-assoc' WHERE association_id IS NULL`).run();
      }
      console.log(`Migration for ${table} complete.`);
    }
  } catch (e) {
    console.error(`Migration failed for ${table}:`, (e as Error).message);
  }
}

// Seed default association and user if none exist
const assocCount = db.prepare("SELECT COUNT(*) as count FROM associations").get() as { count: number };
if (assocCount.count === 0) {
  const defaultAssocId = "default-assoc";
  db.prepare("INSERT INTO associations (id, name, created_at) VALUES (?, ?, ?)").run(defaultAssocId, "SenNoflaay", new Date().toISOString());
  
  // Seed default settings for default assoc
  db.prepare("INSERT OR IGNORE INTO settings (association_id, key, value) VALUES (?, ?, ?)").run(defaultAssocId, "logo_url", "");
  db.prepare("INSERT OR IGNORE INTO settings (association_id, key, value) VALUES (?, ?, ?)").run(defaultAssocId, "app_name", "SenNoflaay");

  // Seed default user for default assoc
  db.prepare("INSERT OR IGNORE INTO users (username, association_id, password, role) VALUES (?, ?, ?, ?)").run("admin", defaultAssocId, "admin123", "superadmin");
}

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // API Routes
  app.get("/api/data", (req, res) => {
    try {
      const associationId = req.query.associationId as string;
      if (!associationId) return res.status(400).json({ error: "associationId required" });

      const members = db.prepare("SELECT * FROM members WHERE association_id = ?").all(associationId);
      const payments = db.prepare("SELECT * FROM payments WHERE association_id = ?").all(associationId);
      const objectives = db.prepare("SELECT * FROM objectives WHERE association_id = ?").all(associationId);
      const expenses = db.prepare("SELECT * FROM expenses WHERE association_id = ?").all(associationId);
      const events = db.prepare("SELECT * FROM events WHERE association_id = ?").all(associationId);
      const bills = db.prepare("SELECT * FROM bills WHERE association_id = ?").all(associationId);
      const corrections = db.prepare("SELECT * FROM corrections WHERE association_id = ?").all(associationId);
      const users = db.prepare("SELECT * FROM users WHERE association_id = ?").all(associationId);
      const auditLogs = db.prepare("SELECT * FROM audit_logs WHERE association_id = ? ORDER BY timestamp DESC").all(associationId);
      const settings = db.prepare("SELECT * FROM settings WHERE association_id = ?").all(associationId);
      const tasks = db.prepare("SELECT * FROM tasks WHERE association_id = ? ORDER BY priority ASC").all(associationId);
      const feeConfig = db.prepare("SELECT * FROM membership_fee_configs WHERE association_id = ?").get(associationId) as any;
      const association = db.prepare("SELECT * FROM associations WHERE id = ?").get(associationId) as any;

      // Map snake_case to camelCase
      const mappedMembers = members.map((m: any) => ({
        ...m,
        associationId: m.association_id,
        firstName: m.first_name,
        lastName: m.last_name,
        joinedDate: m.joined_date,
        tel: m.phone,
        city: m.city,
        gender: m.gender,
        isMinor: m.is_minor === 1,
        linkedMemberId: m.linked_member_id,
        linkedPersonName: m.linked_person_name,
        payments: payments.filter((p: any) => p.member_id === m.id).map((p: any) => ({
          ...p,
          associationId: p.association_id,
          objectiveId: p.objective_id
        }))
      }));

      const mappedFeeConfig = feeConfig ? {
        associationId: feeConfig.association_id,
        frequency: feeConfig.frequency,
        period: feeConfig.period,
        amountAll: feeConfig.amount_all,
        amountMale: feeConfig.amount_male,
        amountFemale: feeConfig.amount_female,
        amountMinor: feeConfig.amount_minor,
        useCategories: feeConfig.use_categories === 1
      } : null;

      res.json({
        association: association ? { ...association, logoUrl: association.logo_url, createdAt: association.created_at } : null,
        members: mappedMembers,
        objectives: objectives.map((o: any) => ({ ...o, associationId: o.association_id })),
        expenses: expenses.map((e: any) => ({ ...e, associationId: e.association_id, objectiveId: e.objective_id, desc: e.description, category: e.category })),
        events: events.map((ev: any) => ({ ...ev, associationId: ev.association_id, bookId: ev.book_id, player: ev.speaker, place: ev.location })),
        bills: bills.map((b: any) => ({ ...b, associationId: b.association_id, fileUrl: b.file_url, fileName: b.file_name })),
        corrections: corrections.map((c: any) => ({ ...c, associationId: c.association_id })),
        users: users.map((u: any) => ({ ...u, associationId: u.association_id })),
        auditLogs: auditLogs.map((l: any) => ({ ...l, associationId: l.association_id, user: l.user_name })),
        settings: settings.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {}),
        tasks: tasks.map((t: any) => ({ ...t, associationId: t.association_id, createdAt: t.created_at })),
        membershipFeeConfig: mappedFeeConfig
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Association Registration
  app.post("/api/associations/register", (req, res) => {
    try {
      const { id, name, adminUsername, adminPassword } = req.body;
      console.log('Registering association:', { id, name, adminUsername });
      
      if (!id || !name || !adminUsername || !adminPassword) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Pre-check for existing association ID
      const existingAssoc = db.prepare("SELECT id FROM associations WHERE id = ?").get(id);
      if (existingAssoc) {
        return res.status(400).json({ error: "Association ID already exists. Please choose another one." });
      }

      const createdAt = new Date().toISOString();
      
      const registerTx = db.transaction(() => {
        db.prepare("INSERT INTO associations (id, name, created_at) VALUES (?, ?, ?)").run(id, name, createdAt);
        db.prepare("INSERT INTO users (username, association_id, password, role) VALUES (?, ?, ?, ?)").run(adminUsername, id, adminPassword, "superadmin");
        db.prepare("INSERT INTO settings (association_id, key, value) VALUES (?, ?, ?)").run(id, "logo_url", "");
        db.prepare("INSERT INTO settings (association_id, key, value) VALUES (?, ?, ?)").run(id, "app_name", name);
      });

      registerTx();

      res.json({ success: true });
    } catch (error) {
      console.error('Registration error:', error);
      const msg = (error as Error).message;
      if (msg.includes('associations.id')) {
        res.status(400).json({ error: "Association ID already exists" });
      } else if (msg.includes('users.username')) {
        res.status(400).json({ error: "Admin username already exists for this association" });
      } else {
        res.status(500).json({ error: msg });
      }
    }
  });

  // Auth / Login
  app.post("/api/auth/login", (req, res) => {
    const { associationId, username, password } = req.body;
    if (!associationId || !username || !password) {
      return res.status(400).json({ error: "Association ID, username, and password are required" });
    }
    const user = db.prepare("SELECT * FROM users WHERE association_id = ? AND username = ? AND password = ?").get(associationId, username, password) as any;
    if (user) {
      res.json({ 
        username: user.username, 
        role: user.role, 
        associationId: user.association_id 
      });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // Members
  app.post("/api/members", (req, res) => {
    const { id, associationId, firstName, lastName, tel, city, fee, joinedDate, gender, isMinor, linkedMemberId, linkedPersonName } = req.body;
    db.prepare("INSERT INTO members (id, association_id, first_name, last_name, phone, city, fee, joined_date, gender, is_minor, linked_member_id, linked_person_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(id, associationId, firstName, lastName, tel, city, fee, joinedDate, gender, isMinor ? 1 : 0, linkedMemberId, linkedPersonName);
    res.json({ success: true });
  });

  app.put("/api/members/:id", (req, res) => {
    const { firstName, lastName, tel, city, fee, joinedDate, gender, isMinor, linkedMemberId, linkedPersonName } = req.body;
    const associationId = req.query.associationId as string;
    db.prepare("UPDATE members SET first_name = ?, last_name = ?, phone = ?, city = ?, fee = ?, joined_date = ?, gender = ?, is_minor = ?, linked_member_id = ?, linked_person_name = ? WHERE id = ? AND association_id = ?").run(firstName, lastName, tel, city, fee, joinedDate, gender, isMinor ? 1 : 0, linkedMemberId, linkedPersonName, req.params.id, associationId);
    res.json({ success: true });
  });

  app.delete("/api/members/:id", (req, res) => {
    const associationId = req.query.associationId as string;
    db.prepare("DELETE FROM members WHERE id = ? AND association_id = ?").run(req.params.id, associationId);
    res.json({ success: true });
  });

  // Membership Fee Config
  app.post("/api/membership-fee-config", (req, res) => {
    const { associationId, frequency, period, amountAll, amountMale, amountFemale, amountMinor, useCategories } = req.body;
    db.prepare(`
      INSERT INTO membership_fee_configs (association_id, frequency, period, amount_all, amount_male, amount_female, amount_minor, use_categories)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(association_id) DO UPDATE SET
        frequency = excluded.frequency,
        period = excluded.period,
        amount_all = excluded.amount_all,
        amount_male = excluded.amount_male,
        amount_female = excluded.amount_female,
        amount_minor = excluded.amount_minor,
        use_categories = excluded.use_categories
    `).run(associationId, frequency, period, amountAll, amountMale, amountFemale, amountMinor, useCategories ? 1 : 0);
    res.json({ success: true });
  });

  // Payments
  app.post("/api/payments", (req, res) => {
    const { id, associationId, memberId, objectiveId, amount, date, method } = req.body;
    db.prepare("INSERT INTO payments (id, association_id, member_id, objective_id, amount, date, method) VALUES (?, ?, ?, ?, ?, ?, ?)").run(id, associationId, memberId, objectiveId, amount, date, method);
    res.json({ success: true });
  });

  // Objectives
  app.post("/api/objectives", (req, res) => {
    const { id, associationId, name, description, target, color } = req.body;
    db.prepare("INSERT INTO objectives (id, association_id, name, description, target, color) VALUES (?, ?, ?, ?, ?, ?)").run(id, associationId, name, description, target, color);
    res.json({ success: true });
  });

  app.delete("/api/objectives/:id", (req, res) => {
    const associationId = req.query.associationId as string;
    db.prepare("DELETE FROM objectives WHERE id = ? AND association_id = ?").run(req.params.id, associationId);
    res.json({ success: true });
  });

  // Expenses
  app.post("/api/expenses", (req, res) => {
    const { id, associationId, objectiveId, amount, date, desc, category } = req.body;
    db.prepare("INSERT INTO expenses (id, association_id, objective_id, amount, date, description, category) VALUES (?, ?, ?, ?, ?, ?, ?)").run(id, associationId, objectiveId, amount, date, desc, category);
    res.json({ success: true });
  });

  // Events
  app.post("/api/events", (req, res) => {
    const { id, associationId, name, date, time, place, player, description, bookId, participants } = req.body;
    db.prepare("INSERT INTO events (id, association_id, name, date, time, location, speaker, description, book_id, participants) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run(id, associationId, name, date, time, place, player, description, bookId, participants || 0);
    res.json({ success: true });
  });

  app.put("/api/events/:id", (req, res) => {
    const { name, date, time, place, player, description, bookId, participants } = req.body;
    const associationId = req.query.associationId as string;
    db.prepare("UPDATE events SET name = ?, date = ?, time = ?, location = ?, speaker = ?, description = ?, book_id = ?, participants = ? WHERE id = ? AND association_id = ?")
      .run(name, date, time, place, player, description, bookId, participants, req.params.id, associationId);
    res.json({ success: true });
  });

  app.delete("/api/events/:id", (req, res) => {
    const associationId = req.query.associationId as string;
    db.prepare("DELETE FROM events WHERE id = ? AND association_id = ?").run(req.params.id, associationId);
    res.json({ success: true });
  });

  // Bills
  app.post("/api/bills", (req, res) => {
    const { id, associationId, title, amount, date, category, fileUrl, fileName, description } = req.body;
    db.prepare("INSERT INTO bills (id, association_id, title, amount, date, category, file_url, file_name, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(id, associationId, title, amount, date, category, fileUrl, fileName, description);
    res.json({ success: true });
  });

  app.delete("/api/bills/:id", (req, res) => {
    const associationId = req.query.associationId as string;
    db.prepare("DELETE FROM bills WHERE id = ? AND association_id = ?").run(req.params.id, associationId);
    res.json({ success: true });
  });

  // Corrections
  app.post("/api/corrections", (req, res) => {
    const { associationId, year, amount, reason } = req.body;
    db.prepare("INSERT OR REPLACE INTO corrections (association_id, year, amount, reason) VALUES (?, ?, ?, ?)").run(associationId, year, amount, reason);
    res.json({ success: true });
  });

  // Users
  app.post("/api/users", (req, res) => {
    const { username, associationId, password, role } = req.body;
    db.prepare("INSERT INTO users (username, association_id, password, role) VALUES (?, ?, ?, ?)").run(username, associationId, password, role);
    res.json({ success: true });
  });

  app.put("/api/users/:username", (req, res) => {
    const { password, role } = req.body;
    const associationId = req.query.associationId as string;
    if (!associationId) return res.status(400).json({ error: "associationId required" });
    
    if (password && password.trim() !== '') {
      db.prepare("UPDATE users SET password = ?, role = ? WHERE username = ? AND association_id = ?").run(password, role, req.params.username, associationId);
    } else {
      db.prepare("UPDATE users SET role = ? WHERE username = ? AND association_id = ?").run(role, req.params.username, associationId);
    }
    res.json({ success: true });
  });

  app.delete("/api/users/:username", (req, res) => {
    const associationId = req.query.associationId as string;
    if (!associationId) return res.status(400).json({ error: "associationId required" });
    db.prepare("DELETE FROM users WHERE username = ? AND association_id = ?").run(req.params.username, associationId);
    res.json({ success: true });
  });

  // Audit Logs
  app.post("/api/audit-logs", (req, res) => {
    const { associationId, userName, action, details, timestamp } = req.body;
    db.prepare("INSERT INTO audit_logs (association_id, user_name, action, details, timestamp) VALUES (?, ?, ?, ?, ?)").run(associationId, userName, action, details, timestamp);
    res.json({ success: true });
  });

  // Settings
  app.post("/api/settings", (req, res) => {
    const { associationId, key, value } = req.body;
    db.prepare("INSERT OR REPLACE INTO settings (association_id, key, value) VALUES (?, ?, ?)").run(associationId, key, value);
    res.json({ success: true });
  });

  // Tasks
  app.post("/api/tasks", (req, res) => {
    try {
      const { id, associationId, title, description, status, priority, createdAt } = req.body;
      db.prepare("INSERT INTO tasks (id, association_id, title, description, status, priority, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run(id, associationId, title, description, status || 'todo', priority || 0, createdAt);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.put("/api/tasks/:id", (req, res) => {
    try {
      const { title, description, status, priority } = req.body;
      const associationId = req.query.associationId as string;
      db.prepare("UPDATE tasks SET title = ?, description = ?, status = ?, priority = ? WHERE id = ? AND association_id = ?")
        .run(title, description, status, priority, req.params.id, associationId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.delete("/api/tasks/:id", (req, res) => {
    try {
      const associationId = req.query.associationId as string;
      db.prepare("DELETE FROM tasks WHERE id = ? AND association_id = ?").run(req.params.id, associationId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/tasks/reorder", (req, res) => {
    try {
      const { associationId, tasks } = req.body; // Array of { id, priority }
      const update = db.prepare("UPDATE tasks SET priority = ? WHERE id = ? AND association_id = ?");
      const transaction = db.transaction((items) => {
        for (const item of items) update.run(item.priority, item.id, associationId);
      });
      transaction(tasks);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // GitHub Updates Integration
  app.get("/api/auth/github/url", (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/github/callback`;
    
    if (!clientId) {
      return res.status(500).json({ error: "GITHUB_CLIENT_ID not configured" });
    }

    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user`;
    res.json({ url });
  });

  app.get("/api/auth/github/callback", async (req, res) => {
    const { code } = req.query;
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!code) return res.status(400).send("No code provided");

    try {
      const response = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      });

      const data = await response.json();
      const accessToken = data.access_token;

      if (!accessToken) {
        throw new Error(data.error_description || "Failed to get access token");
      }

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', token: '${accessToken}' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (error) {
      res.status(500).send(`Auth error: ${(error as Error).message}`);
    }
  });

  app.get("/api/github/updates", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    const owner = process.env.GITHUB_REPO_OWNER || "Thiolom";
    const repo = process.env.GITHUB_REPO_NAME || "SenNoflaay-App";

    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits`, {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to fetch updates");
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
