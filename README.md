# UDOM Central SDA Church Management System

A full-stack church management system built with **Django REST Framework** (backend) and **React + Tailwind CSS** (frontend) for UDOM Central Seventh-day Adventist Church.

---

## Features

- Member registration, profiles, and status management
- Departments, Groups, and Choirs with leaders
- Attendance tracking (Sabbath, Midweek, Youth, Events)
- Tithe & Offerings recording
- Bible Study records
- Baptism & transfer records
- Financial records (income, expenses, pledges)
- Prayer requests (confidential — pastor/elder/admin only)
- Announcements & Events
- Visitor self-registration (public, no login required)
- Monthly reports with auto-generation
- Church doctrines (28 SDA Fundamental Beliefs)
- Live member location map (opt-in)
- Role-based access control (7 roles)
- Pastor as highest authority — can manage all roles including admin

---

## Roles

| Role | Access Level |
|---|---|
| Pastor | Highest — full system access, manage all roles |
| Administrator | Full access — cannot outrank pastor |
| Church Elder | View all prayer requests, members, attendance |
| Church Secretary | Register members, view all data, reports |
| Treasurer | Full financial records access |
| Dept/Group Leader | View members and attendance |
| Member | Own profile, events, announcements, own prayer requests |

---

## Tech Stack

- **Backend**: Python 3, Django 4.2, Django REST Framework, SimpleJWT, SQLite
- **Frontend**: React 18, Vite, Tailwind CSS, Axios, React Router
- **Auth**: JWT (8h access token / 7d refresh token)

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+

### Run (development)

```bash
chmod +x start.sh
./start.sh
```

This starts:
- Backend API: http://localhost:8002
- Frontend: http://localhost:5175
- Django Admin: http://localhost:8002/admin/

### Manual Setup

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 8002
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## Default Login (development)

```
Username: admin
Password: admin123
```

> Change this immediately in production.

---

## Production Deployment

Set the following environment variables before deploying:

```env
DJANGO_SECRET_KEY=<strong-random-key>
DEBUG=False
ALLOWED_HOSTS=yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

Switch the database to PostgreSQL for production use with more than a few hundred concurrent users.

---

## Project Structure

```
UDOM CENTRAL/
├── backend/
│   ├── members/        # Members, departments, groups, choirs, roles
│   ├── reports/        # Attendance, tithe, baptisms, monthly reports
│   ├── events/         # Events, visitor registration
│   ├── finance/        # Income, expenses, pledges
│   ├── communication/  # Announcements
│   ├── prayer/         # Prayer requests
│   ├── doctrines/      # 28 SDA Fundamental Beliefs
│   └── udom_central/   # Django settings & root URLs
├── frontend/
│   └── src/
│       ├── pages/      # All page components
│       ├── components/ # Layout, shared components
│       └── AuthContext.jsx
├── start.sh            # One-command startup script
└── README.md
```
