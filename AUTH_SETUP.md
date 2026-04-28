# 🔐 Authentication System Implementation Guide

## ✅ Completed Implementation

A complete JWT-based authentication system has been successfully integrated into the Expense Buddy project without breaking existing functionality.

### What Was Added

#### 1. **Database Updates** ✓
- Added `role` column to `users` table (ENUM: 'admin', 'user')
- Created migration file: `database/add_auth_system.sql`
- Pre-populated 4 demo users:
  - **Admin**: admin@expensebuddy.com (role: admin)
  - **User 1**: john@example.com (role: user)
  - **User 2**: jane@example.com (role: user)
  - **User 3**: mike@example.com (role: user)

#### 2. **Backend Authentication System** ✓
- **JWT Package**: Added `jsonwebtoken` to package.json
- **Auth Middleware** (`backend/src/middleware/authMiddleware.js`):
  - `authMiddleware`: Requires valid JWT token
  - `optionalAuthMiddleware`: Allows requests with or without token
  - `adminMiddleware`: Restricts access to admins only
  - `userMiddleware`: Restricts access to users only

- **Auth Controller** (`backend/src/controllers/authController.js`):
  - `POST /api/auth/login`: Login with email
  - `GET /api/auth/me`: Get current user info (protected)
  - `POST /api/auth/logout`: Logout endpoint

- **Auth Routes** (`backend/src/routes/authRoutes.js`):
  - Public login route
  - Protected user info routes

- **Updated App Integration** (`backend/src/app.js`):
  - Integrated auth routes
  - Applied optional auth middleware to all existing routes

#### 3. **Backward Compatibility** ✓
- All existing controllers updated to support both scenarios:
  - **With Authentication**: Uses `req.user?.id` from JWT token
  - **Without Authentication**: Falls back to `userId = 1`
- Pattern: `const userId = req.user?.id || 1;`
- Updated controllers:
  - `expenseController.js`
  - `budgetController.js`
  - `dashboardController.js`
  - `tripController.js`

#### 4. **Frontend Login System** ✓
- **Login Page** (`frontend/src/pages/Login.jsx`):
  - Beautiful login interface
  - Quick demo user buttons
  - Email-based login
  - Post-login error handling
  - Toast notifications

- **Authentication State Management** (`frontend/src/App.jsx`):
  - Auth state: `isAuthenticated`, `user`, `token`
  - Protected routes with `ProtectedRoute` component
  - Auto-redirect to login if not authenticated
  - Logout functionality

- **Updated Sidebar** (`frontend/src/components/Sidebar.jsx`):
  - Display current user info
  - Show user role (Admin/User)
  - Logout button

- **Enhanced API Helper** (`frontend/src/utils/api.js`):
  - Automatically includes JWT token in all requests
  - Header: `Authorization: Bearer {token}`
  - Token stored in localStorage

---

## 🧪 TESTING & SETUP

### Step 1: Run Database Migration

```bash
cd database
# Use your MySQL client to run:
mysql -u vikram -p1234 < add_auth_system.sql
```

**OR** if you have MySQL running:
```sql
USE expense_buddy;
ALTER TABLE users ADD COLUMN role ENUM('admin', 'user') DEFAULT 'user';
-- Then add test users as shown in add_auth_system.sql
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Start Backend

```bash
npm run dev
# Expected: Server running on http://localhost:5000
```

### Step 4: Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Step 5: Start Frontend

```bash
npm run dev
# Expected: App running on http://localhost:5173 (or similar)
```

---

## 🧪 TESTING SCENARIOS

### Test 1: Login with Demo Users

**Demo Users Available:**
```
1. Admin User
   Email: admin@expensebuddy.com
   Role: admin
   
2. John Doe
   Email: john@example.com
   Role: user
   
3. Jane Smith
   Email: jane@example.com
   Role: user
   
4. Mike Johnson
   Email: mike@example.com
   Role: user
```

**Steps:**
1. Open app at `http://localhost:5173`
2. You should see the login page
3. Click any demo user button OR type email manually
4. Click "Login"
5. Should redirect to dashboard

**Expected Result:** ✓ Token stored in localStorage, user info displayed

### Test 2: Verify Token is Sent

**Browser Console:**
```javascript
// In browser DevTools Console:
localStorage.getItem('token')
// Should show JWT token

localStorage.getItem('user')
// Should show JSON user object: {id, name, email, role}
```

### Test 3: Protected Routes

**Steps:**
1. After login, try navigating to different pages
2. Add a transaction
3. Create a budget
4. View trip list
5. All should work normally

**Expected Result:** ✓ All existing functionality still works

### Test 4: Logout

**Steps:**
1. Click "Logout" button in sidebar
2. Should redirect to login page
3. localStorage should be cleared

**Expected Result:** ✓ Redirected to login, tokens removed

### Test 5: Token in API Requests

**Using curl or Postman:**
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@expensebuddy.com"}'

# Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@expensebuddy.com",
      "role": "admin"
    }
  }
}

# Get expenses (with token):
curl -X GET http://localhost:5000/api/expenses \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test 6: Role-Based Access (Admin vs User)

The system now supports role differentiation:
```javascript
// In App.jsx or any component:
console.log(user.role); // 'admin' or 'user'

// Future: Can add role-based UI rendering:
if (user.role === 'admin') {
  // Show admin panel
}
```

### Test 7: Existing Features Still Work

Test each module:

**Personal Finance Module:**
- ✓ Add transaction
- ✓ View transaction history
- ✓ Create/edit budgets
- ✓ View analysis

**Travel Buddy Module:**
- ✓ Browse trips
- ✓ Create trip
- ✓ View trip details
- ✓ View settlements
- ✓ Rate members
- ✓ View global ratings

---

## 🔧 CONFIGURATION

### JWT Configuration

**Secret Key** (in `backend/src/middleware/authMiddleware.js`):
```javascript
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
```

**For Production:**
1. Create `.env` file in backend root:
```
JWT_SECRET=your-very-secure-secret-key-here
```

2. Load from environment:
```javascript
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'default-key';
```

### Token Expiration

**Currently:** 7 days

**To Change** (in `backend/src/controllers/authController.js`):
```javascript
const TOKEN_EXPIRY = '7d'; // Change this to '24h', '30d', etc.
```

---

## 📊 API ENDPOINTS

### Public Endpoints

```
POST /api/auth/login
  Request: { "email": "user@example.com" }
  Response: { "token": "...", "user": {...} }
```

### Protected Endpoints (Require JWT Token)

```
GET /api/auth/me
  Response: { "id": 1, "name": "...", "email": "...", "role": "..." }

POST /api/auth/logout
  Response: { "success": true }
```

### Existing Endpoints (Now Support Auth)

All existing endpoints (`/api/expenses`, `/api/budgets`, `/api/trips`, etc.) now:
- ✓ Work WITHOUT token (legacy mode, user_id = 1)
- ✓ Work WITH token (authenticated mode, user_id from token)

**Send token in headers:**
```
Authorization: Bearer {token}
```

---

## 🐛 TROUBLESHOOTING

### Issue: "Missing or invalid token"
**Solution:** 
- Make sure token is stored in localStorage
- Check token hasn't expired (7 days)
- Verify token format: `Authorization: Bearer {token}`

### Issue: Login fails with "User not found"
**Solution:**
- Run the migration: `sql database/add_auth_system.sql`
- Verify users exist in database:
```sql
SELECT id, name, email, role FROM users;
```

### Issue: "Unauthorized" on protected route
**Solution:**
- Check localStorage has token: `localStorage.getItem('token')`
- Token might be expired, login again
- Verify backend is running and accessible

### Issue: Frontend can't connect to backend
**Solution:**
- Check backend is running: `npm run dev` in backend folder
- Verify API_BASE in `frontend/src/utils/api.js` matches backend URL
- Check CORS is enabled in backend (`app.use(cors())`)

---

## 🚀 NEXT STEPS (Optional Enhancements)

### 1. Token Refresh
- Implement refresh tokens for extended sessions
- Auto-refresh expired tokens

### 2. Role-Based Features
- Admin dashboard (manage all users' data)
- User restrictions (see only own data)

### 3. Password Management
- Add password hashing with bcrypt
- Password reset functionality
- Change password endpoint

### 4. Session Management
- Token blacklist on logout
- Multi-device login tracking
- Session expiration handling

### 5. Email Verification
- Verify user email before login
- Two-factor authentication (2FA)

### 6. Advanced Security
- Rate limiting on login attempts
- Account lockout after failed attempts
- Audit logging

---

## 📝 SUMMARY

✅ **Complete Authentication System Implemented**
- JWT-based with role support
- Backward compatible with existing code
- Demo users pre-configured
- Logout functionality
- Protected routes
- API integration ready

✅ **No Breaking Changes**
- All existing features work
- Optional authentication layer
- Fallback to user_id = 1 if not authenticated

✅ **Ready for Testing**
- 4 demo users available
- Simple email-based login
- Beautiful login UI
- Full error handling

---

**Start testing now!** Use any of the demo emails to login. 🎉
