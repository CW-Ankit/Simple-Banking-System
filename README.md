# Banking System

A full-stack banking application for managing users, accounts, balances, and secure money movement between accounts.

## What the application does

### Authentication
- Secure login with JWT-based authorization.
- Session-aware dashboard with protected routes.
- Role-aware user experience:
  - **System User (Admin)** for user/account administration and initial-funds operations.
  - **Non-System User (Customer)** for personal account and transfer operations.

### Account Management
- Create accounts with generated account numbers.
- Rename and delete accounts.
- Retrieve balances for each account from ledger entries.
- Search accounts by owner/name/account number.

### Money Movement
- Transfer funds between active accounts with idempotency protection.
- Support for same-user account-to-account transfers.
- Initial-funds workflow (system user action).
- Transaction lifecycle states (e.g., pending, complete, failed, reversed).
- Double-entry ledger writes (debit + credit) inside MongoDB transactions.

### Transaction Visibility Rules
- Customers only see their own accounts and their own transaction history.
- System user accounts are hidden from customer-facing account discovery flows.
- Any transaction side tied to the system user account is displayed as **Cash Deposit** in customer transaction views.

### Admin Capabilities
- Create, update, search, and delete users.
- Create and manage accounts across users.
- View system-wide account/transaction data.

### Notifications
- Transaction success/failure email notifications are integrated via the backend email service.

### Frontend UX
- Dashboard for overview metrics, accounts, transfers, and transactions.
- Transfer center with:
  - Source account selection.
  - Destination account selection.
  - Manual destination account number entry.
  - Recipient search.
- Responsive layout for desktop, tablet, and mobile screens.

## Tech Stack

### Frontend
- React
- React Router
- Vite

### Backend
- Node.js
- Express
- MongoDB + Mongoose

## API Overview

### Auth
- `POST /api/auth/login`
- `GET /api/auth/me`

### Accounts
- `POST /api/accounts`
- `GET /api/accounts`
- `GET /api/accounts/transfer-targets`
- `PATCH /api/accounts/:accountId`
- `DELETE /api/accounts/:accountId`
- `GET /api/accounts/:accountId/balance`

### Transactions
- `GET /api/transactions`
- `POST /api/transactions`
- `POST /api/transactions/initial-funds`

### Admin
- `GET /api/admin/users`
- `POST /api/admin/users`
- `PATCH /api/admin/users/:userId`
- `DELETE /api/admin/users/:userId`

## Local Setup

### Prerequisites
- Node.js 18+ (recommended)
- npm
- MongoDB instance

### 1) Backend
```bash
cd Backend
npm install
npm run dev
```

Backend runs on the configured server port (default in codebase: `3000` unless overridden).

### 2) Frontend
```bash
cd Frontend
npm install
npm run dev
```

Frontend runs on Vite dev server (default: `5173`), and uses:
- `VITE_API_BASE_URL` (optional) to point to backend API.

## Production Build

```bash
cd Frontend
npm run build
```

## Notes
- The project enforces role-based visibility to prevent system-user account leakage into customer dashboards.
- Idempotency keys are used for transfer safety and duplicate request protection.
