CREATE DATABASE IF NOT EXISTS expense_buddy;
USE expense_buddy;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE personal_expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(120) NOT NULL,
  category VARCHAR(60) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  expense_date DATE NOT NULL,
  notes VARCHAR(255),
  transaction_type ENUM('income','expense') DEFAULT 'expense',
  payment_method VARCHAR(50),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category VARCHAR(60) NOT NULL,
  monthly_limit DECIMAL(10,2) NOT NULL,
  UNIQUE KEY unique_user_category (user_id, category),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE trips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  destination VARCHAR(120) NOT NULL,
  budget DECIMAL(10,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('Planning', 'Open to Join', 'Confirmed', 'Completed') DEFAULT 'Planning'
);

CREATE TABLE trip_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trip_id INT NOT NULL,
  user_id INT NOT NULL,
  role VARCHAR(60) DEFAULT 'Member',
  UNIQUE KEY unique_trip_member (trip_id, user_id),
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE trip_expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trip_id INT NOT NULL,
  paid_by_user_id INT NOT NULL,
  title VARCHAR(120) NOT NULL,
  category VARCHAR(60) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  expense_date DATE NOT NULL,
  split_type ENUM('equal') DEFAULT 'equal',
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (paid_by_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE trip_ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trip_id INT NOT NULL,
  rated_user_id INT NOT NULL,
  reviewer_user_id INT NOT NULL,
  behavior_score DECIMAL(2,1) NOT NULL,
  teamwork_score DECIMAL(2,1) NOT NULL,
  reliability_score DECIMAL(2,1) NOT NULL,
  comment_text VARCHAR(255),
  UNIQUE KEY unique_rating (trip_id, rated_user_id, reviewer_user_id),
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (rated_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_user_id) REFERENCES users(id) ON DELETE CASCADE
);
