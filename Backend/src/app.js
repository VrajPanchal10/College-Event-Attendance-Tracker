const express    = require("express");
const cors       = require("cors");
const path       = require("path");

const authRoutes         = require("./routes/authRoutes");
const authMiddleware     = require("./middlewares/authMiddleware");
const eventRoutes        = require("./routes/eventRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const attendanceRoutes   = require("./routes/attendanceRoutes");
const demoRoutes         = require("./routes/demoRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ── Serve uploaded event banner images ──
// Images are stored in /uploads at the project root (one level above /src)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth",   authRoutes);
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