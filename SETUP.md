# Expense Buddy - Setup & Installation Guide

## 🎯 What's New

This updated version includes:
- ✅ **User Authentication** - Register & Login system with JWT tokens
- ✅ **Secure Passwords** - bcrypt hashing for password storage
- ✅ **User-specific Data** - Each user sees only their own expenses and trips
- ✅ **Fixed Theme** - Default theme is now LIGHT with localStorage persistence
- ✅ **Better Error Handling** - Standardized API responses with error messages
- ✅ **Real-time Updates** - Immediate reflection of changes in the UI
- ✅ **Production Ready** - No hardcoded user IDs

---

## 📋 Prerequisites

Before running the project, ensure you have:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **MySQL** (v8.0+) - [Download](https://dev.mysql.com/downloads/mysql/)
- **MySQL Workbench** or **MySQL CLI** (optional, for database management)

---

## 🗄️ Database Setup

### 1. Create Database
Connect to MySQL and run the schema:

```bash
mysql -u vikram -p1234 < database/schema.sql
```

Or copy-paste the contents of [database/schema.sql](database/schema.sql) into MySQL Workbench.

### 2. Seed Demo Users
Run the seeding script to create demo users with passwords:

```bash
cd backend
node seed-auth.js
```

This creates 4 demo users:
- **Email**: vikram@example.com | **Password**: password123
- **Email**: anas@example.com | **Password**: password123
- **Email**: kartikey@example.com | **Password**: password123
- **Email**: rahul@example.com | **Password**: password123

Or manually add users via the Register page in the app.

---

## 🚀 Running the Project

### Terminal 1: Start Backend Server

```bash
cd backend
npm install           # First time only
npm run dev          # Starts on http://localhost:5000
```

**Expected Output:**
```
Server running on http://localhost:5000
MySQL connected successfully
✓ API ready
```

### Terminal 2: Start Frontend Dev Server

```bash
cd frontend
npm install           # First time only
npm run dev          # Starts on http://localhost:5173
```

**Expected Output:**
```
VITE v5.4.21  ready in XXX ms
➜  Local:   http://localhost:5173/
```

### Terminal 3 (Optional): Monitor Backend Logs

```bash
cd backend
tail -f server.log    # If logging is enabled
```

---

## 🔐 Login & Registration

### First Time Setup
1. Open browser: `http://localhost:5173`
2. Click **"Register here"** to create a new account
3. Fill in: Name, Email, Password (min 6 characters)
4. Click **"Create Account"**
5. You will be logged in automatically

### Returning Users
1. Open browser: `http://localhost:5173`
2. Enter email and password
3. Click **"Login"**

### Demo Credentials
Click the **"Use Demo Account"** button on the login page to pre-fill demo credentials.

---

## 🎨 Theme Settings

- **Default**: Light mode
- **Toggle**: Click the sun/moon icon in the sidebar
- **Persistence**: Your theme choice is saved in localStorage automatically

---

## 🔑 API Endpoints

All endpoints now require authentication. Include the JWT token in headers:

```javascript
Authorization: Bearer {token}
```

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout (optional)
- `GET /api/auth/me` - Get current user info

### Personal Finance (Module A)
- `GET /api/dashboard` - Get overview stats
- `GET /api/expenses` - Get all transactions
- `POST /api/expenses` - Add new transaction
- `GET /api/expenses/analysis` - Get income/expense breakdown
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Add single budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `POST /api/budgets/bulk-update` - Bulk budget update

### Travel Buddy (Module B)
- `GET /api/trips` - List all trips
- `POST /api/trips` - Create trip
- `GET /api/trips/:tripId/analysis` - Trip expense breakdown
- `GET /api/trips/:tripId/settlements` - Calculate who owes whom
- `GET /api/ratings` - Get member ratings
- `GET /api/ratings/trips/rankings` - Get trip rankings

---

## 🛠️ Project Structure

```
expense-buddy-project/
├── backend/
│   ├── src/
│   │   ├── app.js                 (Express app setup)
│   │   ├── server.js              (Server entry point - Port 5000)
│   │   ├── config/
│   │   │   └── db.js              (MySQL connection pool)
│   │   ├── middleware/
│   │   │   └── authMiddleware.js  (JWT authentication)
│   │   ├── controllers/
│   │   │   ├── authController.js  (NEW - Register/Login)
│   │   │   ├── dashboardController.js
│   │   │   ├── expenseController.js
│   │   │   ├── budgetController.js
│   │   │   ├── tripController.js
│   │   │   └── ratingController.js
│   │   └── routes/
│   │       ├── authRoutes.js      (NEW - Auth endpoints)
│   │       ├── dashboardRoutes.js
│   │       ├── expenseRoutes.js
│   │       ├── budgetRoutes.js
│   │       ├── tripRoutes.js
│   │       └── ratingRoutes.js
│   ├── seed-auth.js               (NEW - Demo user seeding)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                (Main app - Protected routes)
│   │   ├── main.jsx               (Entry point with Router)
│   │   ├── pages/
│   │   │   ├── Login.jsx          (NEW - Login page)
│   │   │   └── Register.jsx       (NEW - Register page)
│   │   ├── components/
│   │   │   ├── Sidebar.jsx        (Navigation menu)
│   │   │   ├── ExpenseForm.jsx
│   │   │   ├── BudgetEditForm.jsx
│   │   │   ├── TripForm.jsx
│   │   │   ├── PersonalAnalysis.jsx
│   │   │   └── RatingCard.jsx
│   │   └── utils/
│   │       └── api.js             (API calls + Auth helpers)
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── database/
    ├── schema.sql          (Database schema - Updated with password field)
    ├── seed.sql            (Sample data)
    └── migrate_auth.sql    (Optional - Migration script)
```

---

## 🔄 Key Changes from Previous Version

### Backend Changes
1. **db.js** - Connection pooling already in place ✓
2. **authMiddleware.js** - NEW middleware to verify JWT tokens
3. **authController.js** - NEW controller for register/login
4. **authRoutes.js** - NEW routes for authentication
5. **All other controllers** - Updated to:
   - Use `req.user.id` instead of hardcoded `userId = 1`
   - Return standardized `{ success: true, data: {...} }` responses
   - Add comprehensive error handling with logging
6. **app.js** - Added auth middleware to protected routes

### Frontend Changes
1. **Login.jsx** - NEW login page component
2. **Register.jsx** - NEW registration page component
3. **main.jsx** - Updated with React Router and protected routes
4. **App.jsx** - Updated to:
   - Default theme is `'light'` instead of `'dark'`
   - Load/save theme from localStorage
   - Display actual user name from JWT token
   - Add logout button
5. **api.js** - Updated to:
   - Manage JWT tokens in localStorage
   - Add auth helper functions (login, register, logout)
   - Include token in all API requests

### Database Changes
1. **users table** - Added `password` and `created_at` columns
2. **seed-auth.js** - NEW script to create demo users with bcrypt-hashed passwords

---

## 🐛 Troubleshooting

### "Cannot find module 'bcrypt'"
```bash
cd backend
npm install bcrypt
```

### "Cannot find module 'react-router-dom'"
```bash
cd frontend
npm install react-router-dom
```

### "Access denied for user 'vikram'@'127.0.0.1'"
- Check MySQL is running
- Verify credentials in `backend/src/config/db.js`
- Default: user=`vikram`, password=`1234`, database=`expense_buddy`

### "Port 5000 already in use"
Find and kill process using port 5000:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### "Token expired / Invalid token"
- Log out and log back in
- Tokens are valid for 7 days

### Theme not saving
- Check browser's localStorage is enabled
- Open DevTools → Application → Local Storage

---

## 📊 Testing the App

### Test Personal Finance
1. Login with demo credentials
2. Click **"+ Add Transaction"**
3. Add an income and expense
4. Go to **"Transaction History"** to see entries
5. Go to **"Budgets"** to create budget limits
6. Go to **"Personal Analysis"** to see charts

### Test Travel Buddy
1. Click **"Create Trip"** or **"✈️ Create Trip"** button
2. Fill trip details (title, destination, dates, budget)
3. Go to **"Trips"** to see it grouped by status
4. Click through settlement and analysis pages

### Test Theme Toggle
1. Click the sun/moon icon in sidebar
2. Theme should switch immediately
3. Refresh page - theme should persist

### Test Logout
1. Click the **"🚪 Logout"** button (top right of dashboard)
2. Should redirect to login page
3. Click back arrow or try accessing `/` - redirects to login

---

## 🚀 Deployment

For production deployment:

1. **Environment variables** - Create `.env` file:
```env
DATABASE_HOST=localhost
DATABASE_USER=vikram
DATABASE_PASSWORD=1234
DATABASE_NAME=expense_buddy
JWT_SECRET=your_secure_secret_key_here
PORT=5000
```

2. **Update config/db.js** - Use environment variables:
```javascript
export const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  // ...
});
```

3. **Update middleware/authMiddleware.js** - Use environment JWT_SECRET:
```javascript
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
```

4. **Build frontend**:
```bash
cd frontend
npm run build
# Creates dist/ folder for production
```

5. **Deploy** to hosting platform (Heroku, DigitalOcean, AWS, etc.)

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API response messages (they're detailed now)
3. Check backend logs for detailed error messages
4. Ensure MySQL credentials are correct

---

## ✅ Verification Checklist

- [ ] MySQL running with `expense_buddy` database
- [ ] Backend installed: `npm install` in `/backend`
- [ ] Frontend installed: `npm install` in `/frontend`
- [ ] Backend started: `npm run dev` (Port 5000)
- [ ] Frontend started: `npm run dev` (Port 5173)
- [ ] Demo users seeded: `node seed-auth.js` in backend
- [ ] Can access `http://localhost:5173` in browser
- [ ] Can login with demo credentials
- [ ] Can add transactions and budgets
- [ ] Theme toggles and persists
- [ ] Logout redirects to login page

---

**Happy Tracking! 💰✈️**  
*Expense Buddy - Your Personal Finance & Travel Companion*
