import 'dotenv/config';
import app from './app.js';

// Start the Express server on port 5001
const port = process.env.PORT || 5001;

const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Error handling
server.on('error', (err) => {
  console.error('Server error:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
