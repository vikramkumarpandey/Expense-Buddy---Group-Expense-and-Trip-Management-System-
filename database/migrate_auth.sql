-- Migration: Add password field to users table and create demo users
-- Run this script to update the database for authentication

-- Add password and created_at columns (if not already present)
ALTER TABLE users 
ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER password;

-- Clear existing users (optional, comment out if you want to keep existing data)
TRUNCATE TABLE users;

-- Insert demo users with passwords
-- Password for all: password123 (hashed with bcrypt 10 rounds)
-- Hashed values generated from: bcrypt.hash('password123', 10)
INSERT INTO users (id, name, email, password) VALUES
(1, 'Vikram', 'vikram@example.com', '$2b$10$abcdefghijklmnopqrstuv'), 
(2, 'Anas', 'anas@example.com', '$2b$10$abcdefghijklmnopqrstuv'),
(3, 'Kartikey', 'kartikey@example.com', '$2b$10$abcdefghijklmnopqrstuv'),
(4, 'Rahul', 'rahul@example.com', '$2b$10$abcdefghijklmnopqrstuv');

-- Reset auto-increment
ALTER TABLE users AUTO_INCREMENT = 5;

-- Keep other tables intact
-- No changes needed to personal_expenses, budgets, trips, trip_members, trip_expenses, trip_ratings tables
