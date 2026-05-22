# AeroNetB - Aerospace Supply Chain Management System

## Quick Start

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Set up databases

**PostgreSQL (Render):**
Connect using psql, pgAdmin, or DBeaver and run:
```bash
psql "postgresql://student:kwUEAWH63huAKxefghf4tdxcS5JYweG0@dpg-d87oa099rddc73aq3jbg-a.frankfurt-postgres.render.com/aeronetsql_hg3d" -f sql/schema.sql
psql "postgresql://student:kwUEAWH63huAKxefghf4tdxcS5JYweG0@dpg-d87oa099rddc73aq3jbg-a.frankfurt-postgres.render.com/aeronetsql_hg3d" -f sql/dummy_data.sql
```

**MongoDB Atlas:**
```bash
mongosh "mongodb+srv://Aero_User:dY2SH9YDKcV3vdAy@aeronet.z73bbgp.mongodb.net/aeronetsystem" < mongodb/seed_data.js
```

### 3. Run locally
```bash
cd backend
node server.js
```
Open: http://localhost:3000

### 4. Deploy to Render
1. Push to GitHub
2. Create Web Service on Render
3. Set environment variables (copy from .env)
4. Deploy

### 5. Test accounts
All passwords: `password123`
| Email | Role |
|---|---|
| sarah.johnson@aeronetb.com | Procurement Officer |
| james.chen@aeronetb.com | Quality Inspector |
| maria.garcia@aeronetb.com | Supply Chain Manager |
| david.kim@aeronetb.com | Equipment Engineer |
| emma.wilson@aeronetb.com | Auditor |

## API Endpoints
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/login | No | Login |
| GET | /api/suppliers | Yes | List suppliers |
| POST | /api/suppliers | Procurement | Add supplier |
| GET | /api/orders | Yes | List orders |
| POST | /api/orders | Procurement | Create order |
| PUT | /api/orders/:id/status | Procurement/Manager | Update status |
| GET | /api/shipments | Yes | List shipments |
| GET | /api/qc-reports | Yes | List QC reports |
| POST | /api/qc-reports | Inspector | Create QC report |
| GET | /api/certifications | Yes | List certs |
| PUT | /api/certifications/:id/approve | Inspector | Approve (lock) |
| GET | /api/iot/readings | Yes | Sensor data |
| GET | /api/audit | Auditor/Manager | Audit log |
| GET | /api/dashboard/stats | Yes | Dashboard KPIs |
"# aeronet-database-system" 
