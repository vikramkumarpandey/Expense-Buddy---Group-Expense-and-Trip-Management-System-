import mysql from 'mysql2/promise';

// MySQL connection pool with strict credentials
export const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'vikram',
  password: '1234',
  database: 'expense_buddy',
  waitForConnections: true,
  connectionLimit: 10
});
