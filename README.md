# 🎓 College Event Attendance Tracker

A full-stack web application for managing college events, student registrations, and attendance tracking — built for **CVM University, Department of Computer Engineering**.

---

## 🚀 Tech Stack

![Node.js](https://img.shields.io/badge/Node.js-v24-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-v5-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)
![HTML CSS JS](https://img.shields.io/badge/Frontend-HTML%20%2F%20CSS%20%2F%20JS-F7DF1E?style=flat&logo=javascript&logoColor=black)

| Layer | Technology |
|---|---|
| Backend | Node.js + Express v5 |
| Database | MongoDB + Mongoose |
| Authentication | JWT (JSON Web Tokens) + bcryptjs |
| Frontend | Vanilla HTML, CSS, JavaScript |
| Charts | Chart.js |
| File Upload | Multer |
| Environment | dotenv |

---

## 📁 Project Structure

```
College Event Attendance Tracker/
│
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                  # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.js      # Register, Login, Profile, Change Password
│   │   │   ├── eventController.js     # CRUD for events + image upload
│   │   │   ├── registrationController.js  # Register / Unregister for events
│   │   │   ├── attendanceController.js    # Mark attendance, fetch records
│   │   │   └── demoController.js      # Reset demo data
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js      # JWT verification
│   │   │   ├── roleMiddleware.js      # Role-based access (student / faculty)
│   │   │   └── upload.js             # Multer image upload config
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Event.js
│   │   │   ├── Registration.js
│   │   │   └── Attendance.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── eventRoutes.js
│   │   │   ├── registrationRoutes.js
│   │   │   ├── attendanceRoutes.js
│   │   │   └── demoRoutes.js
│   │   ├── app.js
│   │   └── server.js
│   ├── uploads/                       # Uploaded event banner images
│   ├── .env
│   └── package.json
│
└── Frontend/
    ├── pages/
    │   ├── login.html
    │   ├── register.html
    │   ├── forgot-password.html
    │   ├── student-dashboard.html
    │   ├── faculty-dashboard.html
    │   ├── calendar.html
    │   ├── attendance.html
    │   ├── analytics.html
    │   ├── event-details.html
    │   └── profile.html
    ├── public/
    │   ├── css/
    │   │   ├── components.css         # Shared styles (topbar, cards, toast, modal)
    │   │   ├── student-dashboard.css
    │   │   ├── faculty-dashboard.css
    │   │   ├── calendar.css
    │   │   ├── attendance.css
    │   │   ├── analytics.css
    │   │   ├── event-details.css
    │   │   ├── profile.css
    │   │   ├── LOGIN.css
    │   │   ├── register_style.css
    │   │   ├── responsive.css         # Global responsive design tokens
    │   │   └── index.css
    │   └── js/
    │       ├── auth.js
    │       ├── dashboard.js
    │       ├── faculty.js
    │       ├── calendar.js
    │       ├── attendance.js
    │       ├── analytics.js
    │       ├── events.js
    │       └── profile.js
    └── index.html                     # Landing page
```

---

## ✨ Features

### 🎓 Student
- Register and login securely
- Browse all college events with search and category filters
- Register for events with one click
- Cancel registration (if attendance not yet marked)
- View events on a monthly **calendar** with color-coded category chips
- **Reminder badges** on event cards — "Today!", "Tomorrow", "In 2 days"
- View personal attendance records with Present / Absent status
- Download attendance history
- Update profile and change password
- Secure **forgot password flow** with OTP email verification (EmailJS)

### 🏫 Faculty
- Create, edit, and delete events with optional **banner image upload**
- View all registered students per event
- **Search students** by name or email inside the registrations panel
- Mark individual student attendance with one click
- **Bulk attendance** — "Mark All Present" button marks everyone at once
- Export registrations and attendance as **CSV files**
- View analytics dashboard with charts (Bar, Doughnut, Horizontal Bar)
- Clear all demo data with one click

### 🔐 Security
- Role-based access control (student vs faculty)
- JWT authentication on all protected routes
- Passwords hashed with bcryptjs
- File upload restricted to images only (JPG, PNG, WebP) with 2MB limit

---

## 🛠️ Setup & Installation

### Prerequisites
- Node.js v18 or above
- MongoDB running locally or MongoDB Atlas URI

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/College-Event-Attendance-Tracker.git
cd College-Event-Attendance-Tracker
```

### 2. Install backend dependencies

```bash
cd Backend
npm install
```

### 3. Configure environment variables

Create a `.env` file inside the `Backend/` folder:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/cvm_event_tracker
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
```

### 4. Start the backend server

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

Server runs at `http://localhost:5000`

### 5. Open the frontend

Open `Frontend/index.html` directly in your browser — or use the Live Server extension in VS Code.

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login and get JWT token |
| GET | `/api/auth/profile` | Auth | Get logged-in user profile |
| PUT | `/api/auth/change-password` | Auth | Change password |
| POST | `/api/auth/forgot-password` | Public | Request OTP for password reset |
| POST | `/api/auth/reset-password` | Public | Reset password with OTP |

### Events
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/events` | Auth | Get all events |
| GET | `/api/events/:id` | Auth | Get single event |
| POST | `/api/events` | Faculty | Create event (with optional image) |
| PUT | `/api/events/:id` | Faculty | Update event (with optional image) |
| DELETE | `/api/events/:id` | Faculty | Delete event |

### Registrations
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/register-event` | Student | Register for an event |
| DELETE | `/api/unregister/:eventId` | Student | Cancel registration |
| GET | `/api/my-registrations` | Student | Get own registrations |
| GET | `/api/registrations/:eventId` | Faculty | Get all registrations for event |

### Attendance
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/mark-attendance` | Faculty | Mark student as present |
| GET | `/api/student-attendance` | Student | Get own attendance records |
| GET | `/api/attendance/:eventId` | Faculty | Get attendance for event |

### Demo
| Method | Endpoint | Access | Description |
|---|---|---|---|
| DELETE | `/api/reset-demo` | Faculty | Clear all registrations and attendance |

---

## 🗄️ Database Models

### User
```
name, email, password (hashed), role (student/faculty), createdAt
```

### Event
```
title, category, description, date, venue, imageUrl, createdBy (ref: User), createdAt
```

### Registration
```
studentId (ref: User), eventId (ref: Event), registeredAt
Unique index: studentId + eventId (prevents duplicate registration)
```

### Attendance
```
eventId (ref: Event), studentId (ref: User), markedBy (ref: User), markedAt
Unique index: eventId + studentId (prevents duplicate attendance)
```

---

## 📸 Pages Overview

| Page | Role | Description |
|---|---|---|
| `index.html` | Public | Landing page with features overview |
| `login.html` | Public | Login with role selection |
| `register.html` | Public | Create new account |
| `forgot-password.html` | Public | Request OTP and reset password |
| `student-dashboard.html` | Student | Browse events, register, reminder badges |
| `calendar.html` | Student | Monthly calendar view of events |
| `attendance.html` | Student | Personal attendance records table |
| `faculty-dashboard.html` | Faculty | Create events, manage registrations, attendance |
| `analytics.html` | Faculty | Charts — registrations vs attendance per event |
| `event-details.html` | Student | Full event info + register button |
| `profile.html` | Both | Account info, stats, change password |

---

## 👨‍💻 Author

**Department of Computer Engineering**
CVM University — 2026

---

## 📄 License

This project is built for academic purposes at CVM University.