# 🎓 College Event Attendance Tracker

> A modern, full-stack platform designed to streamline college event management, student registrations, and real-time attendance tracking.


---

## 🌟 Overview
Managing college events often involves messy spreadsheets, manual attendance taking, and disjointed communication. The **College Event Attendance Tracker** solves this by providing a centralized hub where:
- **Faculty** can create events, manage capacity, and mark attendance with a single click.
- **Students** can discover upcoming events, register instantly, and track their participation history.

---

## ✨ Key Features

### 👨‍🎓 For Students
* **Seamless Discovery:** Browse events with real-time search and category filters.
* **Instant Registration:** 1-click registration and cancellation (if attendance isn't marked).
* **Interactive Calendar:** View all upcoming events on a dynamic monthly calendar with color-coded chips.
* **Attendance Tracking:** Monitor personal attendance records (Present/Absent).
* **Account Security:** Full profile management with a secure OTP-based password recovery flow (via EmailJS).

### 👩‍🏫 For Faculty
* **Event Management:** Create, edit, and delete events with custom banner image uploads (Multer).
* **Bulk Attendance:** View all registered students and use "Mark All Present" for massive events.
* **Smart Search:** Instantly filter registered students by name or email.
* **Data Export:** Download event registrations and attendance reports as CSV files.
* **Visual Analytics:** View interactive charts (Chart.js) tracking registration vs. attendance metrics.
* Clear all demo data with one click

### 🔐 Security
* Role-based access control (student vs faculty).
* JWT authentication on all protected routes.
* Passwords hashed with bcryptjs.
* File upload restricted to images only (JPG, PNG, WebP) with 2MB limit.

---

## 🛠️ Tech Stack

![Node.js](https://img.shields.io/badge/Node.js-v24-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-v5-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)
![HTML CSS JS](https://img.shields.io/badge/Frontend-HTML%20%2F%20CSS%20%2F%20JS-F7DF1E?style=flat&logo=javascript&logoColor=black)


| Component | Technology |
|---|---|
| **Backend Framework** | Node.js + Express v5 |
| **Database** | MongoDB + Mongoose |
| **Authentication** | JWT (JSON Web Tokens) + bcryptjs |
| **Frontend UI** | HTML5, CSS3 (CSS Variables, Flexbox/Grid), Vanilla JavaScript |
| **Visualizations** | Chart.js |
| **File Handling** | Multer (for banner image uploads) |
| **Email Service** | EmailJS (OTP Password Reset) |

---

## 📁 Project Structure

```text
College Event Attendance Tracker/
│
├── Backend/
│   ├── src/
│   │   ├── config/              # MongoDB connection
│   │   ├── controllers/         # Logic for auth, events, attendance, registrations
│   │   ├── middlewares/         # JWT verification, Role access, Multer uploads
│   │   ├── models/              # Mongoose Schemas
│   │   ├── routes/              # Express API Routes
│   │   ├── app.js               # Express App Setup
│   │   └── server.js            # Entry Point
│   ├── uploads/                 # Uploaded event banner images
│   ├── .env                     # Environment Variables
│   └── package.json
│
└── Frontend/
    ├── pages/                   # HTML Pages (login, dashboard, calendar, etc.)
    ├── public/
    │   ├── css/                 # Stylesheets (index.css, components.css, responsive.css)
    │   └── js/                  # Frontend logic (auth.js, dashboard.js, API fetches)
    └── index.html               # Landing page
```



## 🚀 Installation & Setup

### Prerequisites
* Node.js (v18 or higher)
* MongoDB (running locally or a MongoDB Atlas URI)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/College-Event-Attendance-Tracker.git
cd "College Event Attendance Tracker"
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend/` root and add your configuration:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/cvm_event_tracker
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=1d
```

Start the server:
```bash
npm run dev    # For development (auto-restarts)
# OR
npm start      # For production
```
*The server will start on `http://localhost:5000`*

### 3. Frontend Setup
The frontend is built with pure Vanilla JS and HTML. No build step is required!
1. Simply open the `Frontend/` folder.
2. Launch `index.html` in your browser (or use the VS Code Live Server extension for the best experience).

---

## 🔌 API Documentation

### Authentication
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Authenticate & receive JWT | Public |
| `GET`  | `/api/auth/profile` | Get current user's profile | Private |
| `PUT`  | `/api/auth/change-password` | Change password | Private |
| `POST` | `/api/auth/forgot-password`| Request OTP for reset | Public |
| `POST` | `/api/auth/reset-password` | Submit OTP + New Password | Public |

### Events & Attendance
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET`  | `/api/events` | Fetch all events | Private |
| `POST` | `/api/events` | Create a new event | Faculty |
| `POST` | `/api/register-event` | Register for an event | Student |
| `GET`  | `/api/attendance/:eventId` | View event attendance | Faculty |
| `POST` | `/api/mark-attendance` | Mark student presence | Faculty |

*(Refer to `routes/` in the backend for the complete API surface)*

---

## 🗄️ Database Schema Overview

* **User**: `name`, `email`, `password` (hashed), `role` (student/faculty).
* **Event**: `title`, `category`, `date`, `venue`, `imageUrl`, `createdBy` (Faculty ID).
* **Registration**: Links `studentId` and `eventId` (Unique compound index prevents double-registration).
* **Attendance**: Links `studentId` and `eventId` with the `markedBy` faculty ID.

---

## 📸 Pages Overview

| Page                     | Role    | Description                                     |
| ------------------------ | ------- | ----------------------------------------------- |
| `index.html`             | Public  | Landing page with features overview             |
| `login.html`             | Public  | Login with role selection                       |
| `register.html`          | Public  | Create new account                              |
| `forgot-password.html`   | Public  | Request OTP and reset password                  |
| `student-dashboard.html` | Student | Browse events, register, reminder badges        |
| `calendar.html`          | Student | Monthly calendar view of events                 |
| `attendance.html`        | Student | Personal attendance records table               |
| `faculty-dashboard.html` | Faculty | Create events, manage registrations, attendance |
| `analytics.html`         | Faculty | Charts — registrations vs attendance per event  |
| `event-details.html`     | Student | Full event info + register button               |
| `profile.html`           | Both    | Account info, stats, change password            |

---

## 👨‍💻 Author
Developed by **Vraj Panchal**

## 📬 Contact Me
- **GitHub:** [VrajPanchal10](https://github.com/VrajPanchal10)
- **LinkedIn:** [https://www.linkedin.com/in/vraj-panchal-a9a104337/](https://www.linkedin.com/in/vraj-panchal-a9a104337/)
- **Email:** [vraj100106@gmail.com](mailto:vraj100106@gmail.com)
