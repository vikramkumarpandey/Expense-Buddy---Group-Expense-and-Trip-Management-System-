# EXPENSE BUDDY - MASTER REGENERATION PROMPT (FULLY UPDATED)

Use this prompt to regenerate the entire Expense Buddy project exactly as implemented today, including authentication, profile, admin analytics, ratings, settlements, and all current routes and database migrations.

## 1) Objective

Build a complete full-stack web application named Expense Buddy with these modules:
- Personal finance: transactions, budgets, analysis
- Travel buddy: trips, members, trip expenses, trip analytics, settlements
- Ratings: post-trip member ratings, global member leaderboard, organiser leaderboard, trip rankings
- Authentication: register/login/logout with JWT and role support
- Profile: user profile view and update
- Admin: admin dashboard with global metrics

The regenerated project must include all backend routes, frontend routes, DB tables/migrations, and integration behavior listed below.

## 2) Exact Tech Stack

Frontend:
- React 18.3.1
- React DOM 18.3.1
- React Router DOM 7.13.1
- Vite 5.4.8
- Tailwind CSS 3.4.13
- Recharts 3.8.0
- Lucide React 0.460.0

Backend:
- Node.js + Express 4.21.0
- mysql2 3.11.3
- jsonwebtoken 9.0.0
- bcrypt 6.0.0
- dotenv 16.4.5
- cors 2.8.5
- ES modules enabled ("type": "module")

Database:
- MySQL
- Database name: expense_buddy

## 3) Project Structure (must match)

```text
expense-buddy-project/
  AUTH_SETUP.md
  AUTHENTICATION_COMPLETE.md
  IMPLEMENTATION_CHECKLIST.md
  MASTER_PROMPT.md
  QUICK_START_AUTH.md
  README.md
  SETUP.md
  migrate.js
  backend/
    package.json
    create_settlements_table.js
    src/
      app.js
      server.js
      config/
        db.js
      middleware/
        authMiddleware.js
      controllers/
        adminController.js
        authController.js
        budgetController.js
        dashboardController.js
        expenseController.js
        ratingController.js
        settlementController.js
        tripController.js
      routes/
        adminRoutes.js
        authRoutes.js
        budgetRoutes.js
        dashboardRoutes.js
        expenseRoutes.js
        ratingRoutes.js
        settlementRoutes.js
        tripRoutes.js
  database/
    schema.sql
    seed.sql
    add_auth_system.sql
    add_profile_fields.sql
    migrate_auth.sql
    update_settlements.sql
  frontend/
    package.json
    index.html
    postcss.config.js
    tailwind.config.js
    vite.config.js
    src/
      main.jsx
      App.jsx
      index.css
      utils/
        api.js
      components/
        BudgetEditForm.jsx
        BudgetForm.jsx
        ExpenseForm.jsx
        PersonalAnalysis.jsx
        RatingCard.jsx
        SettlementEditForm.jsx
        Sidebar.jsx
        StatCard.jsx
        TripForm.jsx
      pages/
        AdminDashboard.jsx
        AdminMembers.jsx
        AdminTrips.jsx
        AdminUsers.jsx
        GlobalRatings.jsx
        GroupSplit.jsx
        Login.jsx
        MemberRatingForm.jsx
        Profile.jsx
        Register.jsx
        TripAnalysis.jsx
        TripDetail.jsx
        TripMembersRating.jsx
        TripRatings.jsx
        TripRatingsDetail.jsx
        TripsList.jsx
        TripsToRate.jsx
```

## 4) Backend Runtime and Configuration

### backend/package.json
- name: expense-buddy-backend
- scripts:
  - dev: node src/server.js
  - start: node src/server.js
- dependencies include bcrypt, cors, dotenv, express, jsonwebtoken, mysql2

### backend/src/config/db.js
Use mysql2/promise connection pool with hardcoded values:
- host: 127.0.0.1
- user: vikram
- password: 1234
- database: expense_buddy
- waitForConnections: true
- connectionLimit: 10

### backend/src/server.js
- Load env with import 'dotenv/config'
- Import app from app.js
- Start server on process.env.PORT || 5001
- Log server URL
- Add server error handling, unhandledRejection, uncaughtException handlers

### backend/src/app.js
- Enable cors and express.json
- Health route: GET /api/health -> { success: true, message: 'Expense Buddy API running' }
- Mount routes:
  - /api/auth
  - /api/admin
  - /api/dashboard (with optionalAuthMiddleware)
  - /api/expenses (with optionalAuthMiddleware)
  - /api/budgets (with optionalAuthMiddleware)
  - /api/trips (with optionalAuthMiddleware)
  - /api/ratings (with optionalAuthMiddleware)
  - /api/settlements (with optionalAuthMiddleware)

## 5) Authentication and Authorization

### JWT rules
- Secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production'
- Expiry: 7d
- Token payload fields: id, email, role, name

### Middleware behavior
- authMiddleware:
  - requires Authorization: Bearer token
  - verifies token, sets req.user
  - returns 401 on missing/invalid token
- optionalAuthMiddleware:
  - if valid bearer token exists, sets req.user
  - if missing or invalid, continue silently
- adminMiddleware:
  - requires req.user and req.user.role === 'admin'
- userMiddleware:
  - requires req.user and req.user.role === 'user'

### user fallback pattern (must preserve)
For backward compatibility in non-protected modules:
- const userId = req.user?.id || 1

This fallback is used in dashboard, expenses, budgets, and trip creation logic.

## 6) Exact Backend APIs

### Auth routes (/api/auth)
- POST /register
- POST /login
- GET /me (auth required)
- GET /profile (auth required)
- PUT /profile (auth required)
- POST /logout (auth required)

Auth controller requirements:
- Register:
  - validate name, email format, password min 6
  - allow role admin only if explicitly passed, otherwise user
  - hash password with bcrypt hash(..., 10)
  - return token + user
- Login:
  - email + password required
  - verify bcrypt password
  - return token + user
- Profile:
  - read/write fields: name, college, age, bio
  - email is read-only in UI

### Admin routes (/api/admin)
All admin routes require authMiddleware + adminMiddleware.
- GET /dashboard
- GET /users
- DELETE /users/:id
- GET /trips
- DELETE /trips/:id
- GET /members
- DELETE /members/:id

Admin dashboard output must aggregate:
- total users
- total trips
- trips by status
- unique trip members count
- total trip expenses
- total personal expenses
- total budgets
- top active users
- top rated user
- pending settlements count
- most expensive trip

### Dashboard routes (/api/dashboard)
- GET /
Returns:
- totalIncome
- totalExpense
- balance
- activeTrips (Planning + Open to Join + Confirmed)
- budgetTotal
- savingsGoalPercent
- recentTransactions (latest 5)

### Expenses routes (/api/expenses)
- GET /
- POST /
- GET /analysis

Expense rules:
- required: title, category, amount, expense_date
- amount > 0
- transaction_type defaults to expense
- analysis returns totalIncome, totalExpense, savings, categoryBreakdown (expense only)

### Budgets routes (/api/budgets)
- GET /available-categories
- GET /
- POST /bulk-update
- POST /
- PUT /:id
- DELETE /:id

Budget rules:
- categories list (14):
  - Food
  - Transport
  - Entertainment
  - Shopping
  - Clothes
  - Education
  - Stationary
  - Rent
  - Recharge
  - Groceries
  - Fruits & Vegetables
  - Fitness
  - Travel
  - Other
- one budget per (user_id, category)
- monthly_limit > 0
- bulk update uses INSERT ... ON DUPLICATE KEY UPDATE
- response includes spent, remaining, usedPercent

### Trips routes (/api/trips)
- GET /
- POST /
- GET /:tripId/members
- POST /:tripId/join (auth required)
- PUT /:tripId/status (auth required)
- GET /:tripId/expenses
- POST /:tripId/expenses
- GET /:tripId/analysis
- GET /:tripId/settlements

Trip rules:
- GET / updates old trips to Completed when end_date < CURDATE()
- Create trip requires title, destination, budget, start_date, end_date
- budget > 0
- creator added as Coordinator in trip_members
- join requires authenticated user and prevents duplicates
- status update allowed only for Coordinator of that trip

Trip settlements (calculated endpoint /trips/:tripId/settlements):
- equal split algorithm:
  - compute paid and owed per member
  - balance = paid - owed
  - derive debtor->creditor transfers with greedy matching
  - round to 2 decimals

### Ratings routes (/api/ratings)
- POST /
- GET /
- GET /trips/rankings
- GET /trip/:tripId
- GET /global/members
- GET /global/organisers

Rating rules:
- submit requires trip_id, rated_user_id, reviewer_user_id (from auth or fallback body)
- cannot rate self
- all scores between 1 and 5
- both users must be trip members
- upsert on duplicate unique key (trip_id, rated_user_id, reviewer_user_id)

Badge behavior:
- baseline set uses participative/improvement/friendly/best-coordinator style arrays in detailed views
- global leaderboards use Elite/Excellent/Reliable/Good/Needs Improvement thresholds

### Settlements routes (/api/settlements)
- GET /:tripId
- POST /bulk-update
- PUT /:id/mark-paid

Manual settlements behavior:
- bulk update supports insert/update/delete in one call
- supports soft deleted payload items via isDeleted
- join with users table to return from_user_name and to_user_name
- mark-paid sets status to paid

## 7) Database Schema and Migration Strategy

## Base schema (database/schema.sql)
Create:
- users (id, name, email unique, password, created_at)
- personal_expenses
- budgets (unique user/category)
- trips
- trip_members (unique trip/user)
- trip_expenses
- trip_ratings (unique trip/rated/reviewer)

## Migration files (must exist and be used)
1. database/add_auth_system.sql
- add role enum(admin,user) to users
- inserts/updates demo role users
- adds email index

2. database/add_profile_fields.sql
- add college, age, bio columns (IF NOT EXISTS)
- ensure role column exists
- set hashed password for existing empty/null passwords
- align demo roles

3. database/update_settlements.sql
- create settlements table:
  - id
  - trip_id
  - from_user_id
  - to_user_id
  - amount
  - status enum(pending, paid)
  - created_at

4. database/migrate_auth.sql
- legacy migration script exists in repo (contains placeholder hashes)
- keep file for history/compatibility even if add_profile_fields.sql is the practical migration path

5. database/update_settlements.sql
- create settlements table

6. database/add_trip_filters.sql
- add trip ownership and matching filters columns to trips table
- columns: created_by, min_age, max_age, required_college, preferred_gender, required_travel_style
- create index on created_by
- add foreign key constraint

7. database/seed.sql
- inserts demo users with @example.com emails
- inserts sample personal expenses, budgets, trips, trip members, trip expenses, trip ratings

## Important schema note
Auth/profile controllers require users table to support:
- role
- college
- age
- bio

Therefore, regenerated setup must run migrations so schema supports those fields before app usage.

## 8) Frontend Runtime and Config

### frontend/package.json
- scripts: dev, build
- dependencies: react, react-dom, react-router-dom, recharts, lucide-react
- devDependencies: vite, @vitejs/plugin-react, tailwindcss, postcss, autoprefixer

### frontend/vite.config.js
- proxy /api -> http://localhost:5000
- rewrite path by removing /api prefix before forwarding

### frontend/src/utils/api.js
- API_BASE = http://localhost:5000/api
- fetchJson adds Authorization header when token exists in localStorage
- if response has data key, return response.data else return full response body

### frontend/src/main.jsx
- BrowserRouter wraps App

### frontend/src/index.css
- tailwind base/components/utilities imports
- standard reset and button cursor styling

## 9) Frontend App Behavior and Route Map

Authentication gate:
- If no token/user in localStorage, app renders login/register routes only
- Authenticated users see sidebar + protected app
- Admin users redirect from / to /admin-dashboard

Theme:
- stored in localStorage key theme
- supports dark/light via root class toggle

Main routes in App.jsx:
- /admin-dashboard -> AdminDashboard (admin only)
- /admin/users -> AdminUsers (admin only)
- /admin/trips -> AdminTrips (admin only)
- /admin/members -> AdminMembers (admin only)
- / -> Dashboard for non-admin, redirect for admin
- /dashboard -> redirects to /
- /add-transaction -> ExpenseForm
- /transactions -> transaction history table
- /budgets -> budget management and bulk edit
- /analysis -> personal analysis
- /trips -> TripsList
- /trips/:id -> TripDetail
- /trip-analysis
- /trip-analysis/:id
- /group-split -> redirects to /group-settlement
- /group-settlement
- /group-settlement/:id
- /trip-ratings
- /trip-ratings/:tripId
- /post-trip-ratings
- /post-trip-ratings/:tripId
- /post-trip-ratings/:tripId/member/:userId
- /global-ratings
- /profile
- * -> 404 text

Public routes when unauthenticated:
- /register
- * -> Login

Data-loading in App.jsx must include:
- /dashboard
- /expenses
- /budgets
- /trips
- /ratings
- /ratings/trips/rankings
- /expenses/analysis

Trip detail prefetch flow must include:
- /trips/:tripId/expenses
- /trips/:tripId/members
- /trips/:tripId/settlements
- /settlements/:tripId

### Page/component responsibilities
- Login.jsx: email/password login, success/error states, stores token/user
- Register.jsx: register name/email/password/role, stores token/user
- Profile.jsx: view/update name/college/age/bio using /auth/profile
- Sidebar.jsx: navigation sections, theme toggle, user details, logout
- AdminDashboard.jsx: consumes /api/admin/dashboard
- ExpenseForm.jsx: add transaction
- BudgetEditForm.jsx: add/edit multiple budgets, submit to /budgets/bulk-update
- PersonalAnalysis.jsx: charts for income/expense/category
- TripsList.jsx: list and create trips
- TripDetail.jsx: members, join, status update, links to analysis/settlement
- TripAnalysis.jsx: trip-level category spending analysis
- GroupSplit.jsx: calculated and manual settlements with mark-paid flow
- TripsToRate.jsx / TripMembersRating.jsx / MemberRatingForm.jsx: post-trip rating flow
- TripRatings.jsx / TripRatingsDetail.jsx: read trip rating outputs
- GlobalRatings.jsx: member leaderboard, organiser leaderboard, trip rankings
- StatCard.jsx and RatingCard.jsx: reusable display components

## 10) Known Drift and Required Regeneration Consistency

The current repo has historical drift. Regenerated output should preserve features while being internally consistent.

Key drift points to account for:
- Backend default port is 5001, but frontend API/proxy target is 5000.
- Base schema.sql does not include role/college/age/bio; migrations add them.
- README and older docs may mention auth not implemented, but auth is now implemented.

Regeneration rule:
- Keep all implemented features and routes.
- Keep migration files.
- Ensure run instructions clearly execute migrations so profile/auth columns and settlements table exist.
- Ensure frontend can reach backend in dev by aligning documented port strategy.

## 11) Setup/Run Order for Regenerated Project

Use this order:
1. Create database expense_buddy.
2. Run schema.sql.
3. Run add_auth_system.sql.
4. Run add_profile_fields.sql.
5. Run update_settlements.sql.
6. Run add_trip_filters.sql.
7. Run seed.sql.
8. Install backend dependencies and run backend.
9. Install frontend dependencies and run frontend.

Optional:
- keep migrate_auth.sql as legacy reference script.
- keep create_settlements_table.js as helper script for table creation.

## 12) Response Format Conventions (existing behavior)

Most controllers use:
- Success: { success: true, data: ... } with optional message
- Error: { success: false, message: ..., error: ... }

Some settlement endpoints return legacy plain JSON arrays/messages; preserve compatibility with existing frontend expectations.

## 13) Regeneration Acceptance Checklist

The regenerated project is complete only when all are true:
- All files listed in project structure exist.
- All backend route paths and auth requirements match this spec.
- All frontend routes in App.jsx match this spec.
- Users can register/login and access protected routes.
- Profile page can load and update college/age/bio.
- Admin dashboard works for admin role.
- Admin users, trips, and members management works.
- Trip creation, joining, status update, expenses, analysis, settlements all work.
- Manual settlement bulk update and mark-paid work.
- Rating submission and all rating leaderboards work.
- Database migrations create role/profile/settlements/trip filters structures.
- API integration works across frontend and backend without missing endpoints.

Use this document as the single source of truth when regenerating the complete Expense Buddy project.
