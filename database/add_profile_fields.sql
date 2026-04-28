-- Migration: Add profile fields and set passwords for existing users
-- Run this AFTER the existing schema is in place
-- Default password for all existing users: password123

USE expense_buddy;

-- Add profile columns (safe: ignores if column already exists)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS college VARCHAR(120) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS age INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS bio VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS gender VARCHAR(40) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS city VARCHAR(120) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS state VARCHAR(120) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS country VARCHAR(120) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS degree VARCHAR(120) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS branch VARCHAR(120) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS interests TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS hobbies TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS travel_style VARCHAR(40) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS food_preference VARCHAR(40) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS sleep_preference VARCHAR(40) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS drinking_preference VARCHAR(40) DEFAULT NULL;

-- Update existing users with bcrypt-hashed password for 'password123'
-- Hash generated with bcrypt.hash('password123', 10)
UPDATE users SET password = '$2b$10$PQB6lv5EetcP.ZSj7mfouuqB.7beq3JBhPSlwad/J0sOwakxAKfq'
WHERE password = '' OR password IS NULL;

-- Ensure role column exists (from add_auth_system.sql)
ALTER TABLE users ADD COLUMN IF NOT EXISTS role ENUM('admin', 'user') DEFAULT 'user';

-- Ensure existing demo users have correct roles
-- Vikram (admin)
UPDATE users SET role = 'admin' WHERE email = 'vikram@geu.com';
UPDATE users SET role = 'admin' WHERE email = 'vikram@example.com';

-- Other users (user role)
UPDATE users SET role = 'user' WHERE role IS NULL;
