# Military Asset Management System

## 1. Project Overview

### Description

This solution provides an initial full-stack framework for managing military assets such as vehicles, weapons and ammunition across multiple bases. The platform supports asset purchases, transfers, assignments to personnel, and expenditure logging while surfacing opening balances, closing balances and net movements through a secure dashboard.

### Primary Objectives

- Improve transparency across bases
- Streamline logistics workflows
- Preserve traceability for all operational transactions
- Enforce accountability through role-based access control

### Assumptions

- The requested technology constraint was prioritized: backend uses Node.js + Express, database uses MongoDB, and frontend uses React + Vite
- Balances are derived from transaction history rather than a separate inventory snapshot engine
- Closing balance is treated as: Opening Balance + Purchases + Transfer In - Transfer Out - Assigned - Expended
- Base Commander and Logistics Officer accounts are linked to a single assigned base
- Transfers are treated as completed movements for the initial framework

### Limitations

- No attachment storage for transfer or procurement documents in this first version
- No approval workflow for transfers or assignments yet
- No pagination or advanced analytics layer yet
- MongoDB was used because it was explicitly requested, even though the original prompt also mentioned choosing a relational database

## 2. Tech Stack & Architecture

### Frontend

- React 18 with Vite
- React Router for navigation
- Axios for API communication
- React Hot Toast for feedback messages
- React Icons for iconography
- Custom CSS with light and dark mode support

### Backend

- Node.js with Express
- JWT-based authentication
- Middleware-based RBAC enforcement
- Mongoose ODM for schema validation and relationships
- Morgan + dedicated audit log collection for request and transaction logging

### Database

- MongoDB with referenced collections

### Why This Stack

- React + Vite gives fast development feedback and a clean single-page workflow
- Express provides a straightforward REST API structure with middleware-based security
- MongoDB is flexible for document-driven operational records such as purchases, transfers, and assignments
- Mongoose adds schema discipline, validation, indexing, and references between collections
- The stack is easy to extend into a more advanced enterprise deployment later

### High-Level Architecture

```text
React Frontend
    |
    v
Express REST API
    |
    +-- Auth Middleware (JWT)
    +-- RBAC Middleware
    +-- Controllers / Services
    |
    v
MongoDB Collections
    |
    +-- Users
    +-- Bases
    +-- EquipmentTypes
    +-- Purchases
    +-- Transfers
    +-- Assignments
    +-- Expenditures
    +-- AuditLogs
```

## 3. Data Models / Schema

### Core Collections

#### Users

- `name`
- `email`
- `passwordHash`
- `role`
- `assignedBase`
- `active`

#### Bases

- `name`
- `code`
- `location`

#### EquipmentTypes

- `name`
- `category`
- `unitOfMeasure`
- `description`

#### Purchases

- `base`
- `equipmentType`
- `quantity`
- `unitCost`
- `vendor`
- `referenceNo`
- `purchasedAt`
- `createdBy`

#### Transfers

- `fromBase`
- `toBase`
- `equipmentType`
- `quantity`
- `reason`
- `transferredAt`
- `status`
- `createdBy`

#### Assignments

- `base`
- `equipmentType`
- `quantity`
- `assigneeName`
- `assigneeIdentifier`
- `purpose`
- `assignedAt`
- `createdBy`

#### Expenditures

- `base`
- `equipmentType`
- `quantity`
- `reason`
- `operationReference`
- `expendedAt`
- `createdBy`

#### AuditLogs

- `actor`
- `action`
- `module`
- `resourceId`
- `metadata`
- `ipAddress`
- `userAgent`
- `createdAt`

### Relationship Summary

- One base can have many users, purchases, assignments and expenditures
- One equipment type can appear in many purchases, transfers, assignments and expenditures
- Transfers connect two bases and preserve movement history
- Audit logs reference the acting user and the affected business record

## 4. RBAC Explanation

### Roles

#### Admin

- Full access to all bases and all modules
- Can view global dashboard data
- Can create purchases, transfers, assignments and expenditures

#### Base Commander

- Access restricted to their assigned base
- Can view dashboard data for their base
- Can create and view purchases, transfers, assignments and expenditures for their base

#### Logistics Officer

- Access restricted to their assigned base
- Can view dashboard data for their base
- Can create and view purchases and transfers
- Cannot create assignments or expenditures

### Enforcement Method

- JWT authentication identifies the current user
- Express middleware protects routes
- Role authorization middleware checks operation-level access
- Base scope helpers prevent users from acting outside their assigned base

## 5. API Logging

### How Logging Is Handled

- Morgan logs incoming HTTP requests at the API layer
- A dedicated `AuditLog` collection stores business transaction events
- Every create operation for purchases, transfers, assignments and expenditures writes an audit entry
- Each audit log stores:
  - actor
  - action type
  - module
  - resource id
  - metadata such as base, equipment type and quantity
  - IP address
  - user agent

### Benefits

- Supports operational traceability
- Enables audit readiness and accountability reviews
- Simplifies incident investigation and change tracking

## 6. Setup Instructions

### Prerequisites

- Node.js 20+ recommended
- npm 10+
- MongoDB local instance or MongoDB Atlas

### Backend Setup

1. Open the `backend` folder
2. Copy `.env.example` to `.env`
3. Configure:
   - `PORT`
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLIENT_URL`
4. Run `npm install`
5. Run `npm run seed`
6. Run `npm run dev`

### Frontend Setup

1. Open the `frontend` folder
2. Copy `.env.example` to `.env`
3. Set `VITE_API_URL=http://localhost:5000/api/v1`
4. Run `npm install`
5. Run `npm run dev`

## 7. API Endpoints

### Authentication

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

### Dashboard

- `GET /api/v1/dashboard/summary`
- `GET /api/v1/dashboard/net-movement-details`

### Master Data / Lookups

- `GET /api/v1/lookups/bases`
- `GET /api/v1/lookups/equipment-types`
- `GET /api/v1/lookups/users`

### Transactions

- `GET /api/v1/purchases`
- `POST /api/v1/purchases`
- `GET /api/v1/transfers`
- `POST /api/v1/transfers`
- `GET /api/v1/assignments`
- `POST /api/v1/assignments`
- `GET /api/v1/expenditures`
- `POST /api/v1/expenditures`

## 8. Login Credentials

### Seeded Accounts

- Admin
  - Email: `admin@milassets.local`
  - Password: `Admin@123`

- Base Commander
  - Email: `commander.alpha@milassets.local`
  - Password: `Commander@123`

- Logistics Officer
  - Email: `logistics.alpha@milassets.local`
  - Password: `Logistics@123`

## Additional Notes

- The dashboard supports date, base and equipment type filters
- Clicking Net Movement opens a detailed modal for Purchases, Transfer In and Transfer Out
- The frontend includes both light and dark themes
- The project uses a clean folder structure to support future expansion
