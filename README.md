# Digital Parcel Repository

A hostel parcel management system built with the MERN stack.

## Project Structure

```
digital_parcel_repo/
├── server/          # Express + MongoDB backend
└── client/          # React + Tailwind frontend
```

## Setup

### 1. Backend

```bash
cd server
npm install
```

Edit `.env` with your values:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/digital_parcel
JWT_SECRET=your_jwt_secret_here
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

> For `EMAIL_PASS`, use a Gmail **App Password** (not your regular password).  
> Enable it at: Google Account → Security → 2-Step Verification → App Passwords

```bash
npm run dev     # requires nodemon: npm install -g nodemon
# or
npm start
```

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies `/api` to `http://localhost:5000`.

---

## Seeding an Admin User

There is no admin registration route (by design). Seed one directly in MongoDB:

```js
// In mongosh
use digital_parcel

db.users.insertOne({
  name: "Admin",
  rollNumber: "ADMIN001",
  email: "admin@hostel.com",
  password: "<bcrypt hash of your password>",
  role: "admin"
})
```

Or run this one-time seed script from the `server/` folder:

```bash
node seed.js
```

---

## API Summary

| Method | Route | Access |
|--------|-------|--------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| POST | /api/parcels | Admin |
| GET | /api/parcels/mine | Student |
| PATCH | /api/parcels/release | Admin |
| GET | /api/parcels/search?roll=XXXX | Admin |
| GET | /api/parcels/dashboard | Admin |

---

## Git Branch Structure

- `main` — production
- `develop` — integration
- `feature/auth-module` — login, register, JWT middleware
- `feature/parcel-core` — parcel CRUD, OTP, search
- `feature/ui-notifications` — dashboard, email utility, toast alerts
