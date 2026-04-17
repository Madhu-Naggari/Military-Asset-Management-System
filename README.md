# Military Asset Management System

Initial framework for a Military Asset Management System that supports secure tracking of purchases, transfers, assignments, expenditures, and dashboard-based stock visibility across multiple bases.

## Project Structure

```text
.
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── seed
│   │   ├── services
│   │   └── utils
├── docs
├── frontend
│   └── src
│       ├── api
│       ├── components
│       ├── context
│       ├── data
│       ├── layout
│       ├── pages
│       └── styles
└── scripts
```

## Quick Start

### Backend

1. Copy `backend/.env.example` to `backend/.env`
2. Update the MongoDB connection string and JWT secret
3. Install dependencies:

```bash
cd backend
npm install
```

4. Seed demo data:

```bash
npm run seed
```

5. Start the backend:

```bash
npm run dev
```

### Frontend

1. Copy `frontend/.env.example` to `frontend/.env`
2. Install dependencies:

```bash
cd frontend
npm install
```

3. Start the frontend:

```bash
npm run dev
```

## Default Login Credentials

- Admin: `admin@milassets.local` / `Admin@123`
- Base Commander: `commander.alpha@milassets.local` / `Commander@123`
- Logistics Officer: `logistics.alpha@milassets.local` / `Logistics@123`

## Documentation Deliverable

The requested architecture and submission document is available here:

- `docs/Military-Asset-Management-System-Overview.md`
- `docs/Military-Asset-Management-System-Overview.pdf`
