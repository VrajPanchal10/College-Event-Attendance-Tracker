const dotenv = require("dotenv");

// ── Load .env FIRST, before anything else reads process.env ──
dotenv.config();

const app       = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();              // wait for MongoDB before accepting traffic
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
