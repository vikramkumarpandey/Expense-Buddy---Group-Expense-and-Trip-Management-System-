# Expense Buddy

A student full-stack project for:
- personal expense tracking
- budget tracking
- trip planning
- group expense splitting
- settlement suggestions
- post-trip ratings
- global rating board

## Tech stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: MySQL
- Authentication: intentionally skipped for Phase 1 / Phase 2
- Hosting: intentionally skipped

## Project structure
- `frontend/` React app
- `backend/` Express API
- `database/` MySQL schema and seed 

## How to run

### 1) MySQL
Create a MySQL database named `expense_buddy`. 


Then run:
```sql
SOURCE database/schema.sql;
SOURCE database/seed.sql;
``` 

### 2) Backend
```bash
cd backend
npm install
npm run dev 

```

Create `.env` in `backend/`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=expense_buddy
``` 

### 3) Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on Vite default port.
Backend runs on port 5000.

## Notes
- This version uses mock-friendly but real API-connected structure.
- JWT auth is intentionally not included yet.
- Code is kept clean and student-friendly.
