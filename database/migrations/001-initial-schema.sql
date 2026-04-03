-- Database Schema for SenNoflaay - PostgreSQL
-- This file creates all tables required for the application
-- For Supabase: Run this SQL in the SQL Editor
-- For local PostgreSQL: This is automatically loaded via docker-compose

-- Create Associations table
CREATE TABLE IF NOT EXISTS associations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create Users table with proper authentication
CREATE TABLE IF NOT EXISTS users (
  username TEXT NOT NULL,
  association_id TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (username, association_id),
  FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE
);

-- Create Members table
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  association_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  fee DECIMAL(10, 2) DEFAULT 0,
  joined_date TEXT,
  gender TEXT,
  is_minor BOOLEAN DEFAULT FALSE,
  linked_member_id TEXT,
  linked_person_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE
);

-- Create Objectives (Financial Goals)
CREATE TABLE IF NOT EXISTS objectives (
  id TEXT PRIMARY KEY,
  association_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  target DECIMAL(12, 2) NOT NULL,
  color TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE
);

-- Create Payments table
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  association_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  objective_id TEXT,
  amount DECIMAL(12, 2) NOT NULL,
  date TEXT NOT NULL,
  method TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (objective_id) REFERENCES objectives(id) ON DELETE SET NULL
);

-- Create Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  association_id TEXT NOT NULL,
  objective_id TEXT,
  category TEXT,
  amount DECIMAL(12, 2) NOT NULL,
  date TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE,
  FOREIGN KEY (objective_id) REFERENCES objectives(id) ON DELETE SET NULL
);

-- Create Events table
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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE
);

-- Create Bills table
CREATE TABLE IF NOT EXISTS bills (
  id TEXT PRIMARY KEY,
  association_id TEXT NOT NULL,
  title TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  date TEXT NOT NULL,
  category TEXT,
  file_url TEXT,
  file_name TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE
);

-- Create Corrections (Adjustments) table
CREATE TABLE IF NOT EXISTS corrections (
  association_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (association_id, year),
  FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE
);

-- Create Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  association_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE,
  INDEX idx_audit_association (association_id),
  INDEX idx_audit_timestamp (timestamp)
);

-- Create Settings table (key-value storage for configuration)
CREATE TABLE IF NOT EXISTS settings (
  association_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (association_id, key),
  FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE
);

-- Create Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  association_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE,
  INDEX idx_tasks_association (association_id),
  INDEX idx_tasks_status (status)
);

-- Create Membership Fee Config table
CREATE TABLE IF NOT EXISTS membership_fee_configs (
  association_id TEXT PRIMARY KEY,
  frequency TEXT NOT NULL DEFAULT 'yearly',
  period TEXT NOT NULL DEFAULT 'yearly',
  amount_all DECIMAL(10, 2) DEFAULT 0,
  amount_male DECIMAL(10, 2) DEFAULT 0,
  amount_female DECIMAL(10, 2) DEFAULT 0,
  amount_minor DECIMAL(10, 2) DEFAULT 0,
  use_categories BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_members_association ON members(association_id);
CREATE INDEX IF NOT EXISTS idx_payments_member ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_association ON payments(association_id);
CREATE INDEX IF NOT EXISTS idx_objectives_association ON objectives(association_id);
CREATE INDEX IF NOT EXISTS idx_expenses_association ON expenses(association_id);
CREATE INDEX IF NOT EXISTS idx_events_association ON events(association_id);
CREATE INDEX IF NOT EXISTS idx_bills_association ON bills(association_id);
CREATE INDEX IF NOT EXISTS idx_users_association ON users(association_id);

-- Enable Row Level Security (Supabase only)
-- ALTER TABLE associations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE members ENABLE ROW LEVEL SECURITY;
-- And all other tables...

-- Seed default association (optional)
INSERT INTO associations (id, name, created_at)
VALUES ('default-assoc', 'SenNoflaay', NOW())
ON CONFLICT (id) DO NOTHING;

-- Seed default admin user (IMPORTANT: Change password in production!)
-- Password is 'admin123' hashed with bcrypt
INSERT INTO users (username, association_id, password, role, created_at)
VALUES ('admin', 'default-assoc', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm', 'superadmin', NOW())
ON CONFLICT (username, association_id) DO NOTHING;

-- Create seed default settings
INSERT INTO settings (association_id, key, value, created_at)
VALUES 
  ('default-assoc', 'app_name', 'SenNoflaay', NOW()),
  ('default-assoc', 'logo_url', '', NOW())
ON CONFLICT (association_id, key) DO NOTHING;
