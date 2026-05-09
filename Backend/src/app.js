const express    = require("express");
const cors       = require("cors");
const path       = require("path");

const authRoutes         = require("./routes/authRoutes");
const authMiddleware     = require("./middlewares/authMiddleware");
const eventRoutes        = require("./routes/eventRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const attendanceRoutes   = require("./routes/attendanceRoutes");
const demoRoutes         = require("./routes/demoRoutes");

const helmet     = require("helmet");
const rateLimit  = require("express-rate-limit");

const app = express();

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allows images to be loaded from other domains (like Netlify)
}));
app.use(cors());
app.use(express.json());

// Rate limiting — prevents brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { message: "Too many requests from this IP, please try again after 15 minutes" }
});

// ── Serve uploaded event banner images ──
// Images are stored in /uploads at the project root (one level above /src)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth",   authLimiter, authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api",        registrationRoutes);
app.use("/api",        attendanceRoutes);
app.use("/api",        demoRoutes);


// Test route
app.get("/", (req, res) => {
  res.json({ message: "Backend is running successfully 🚀" });
});

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route accessed successfully",
    user: req.user
  });
});

module.exports = app;