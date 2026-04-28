-- Add authentication system to Expense Buddy
-- This migration adds role-based access control

USE expense_buddy;

-- Add role column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN role ENUM('admin', 'user') DEFAULT 'user';

-- Create initial admin user
-- Email: vikram@geu.com (admin)
INSERT IGNORE INTO users (name, email, role) 
VALUES ('Vikram', 'vikram@geu.com', 'admin');

-- Add other test users with 'user' role
INSERT IGNORE INTO users (name, email, role) 
VALUES 
  ('Kartik', 'kartik@geu.com', 'user'),
  ('Anas', 'anas@geu.com', 'user');

-- Add created_at index for faster queries
ALTER TABLE users ADD INDEX idx_email (email);
