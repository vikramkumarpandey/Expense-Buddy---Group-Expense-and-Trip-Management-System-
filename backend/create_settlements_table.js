import { pool } from './src/config/db.js';
const setup = async () => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS settlements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      trip_id INT,
      from_user_id INT,
      to_user_id INT,
      amount DECIMAL(10,2),
      status ENUM('pending', 'paid') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
      FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);
    console.log('Table created!');
  } catch(e) {
    console.error(e);
  }
  process.exit();
}
setup();
