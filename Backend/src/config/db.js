const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4 // Use IPv4, skip trying IPv6
    };
    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    console.log(`MongoDB Connected Successfully ✅ (db: ${conn.connection.name})`);
  } catch (error) {
    console.error("MongoDB Connection Failed ❌");
    console.error(error.message);
    process.exit(1);
  }
};

// ── Connection event monitoring ──
mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected ⚠️");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected ✅");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err.message);
});

// ── Graceful shutdown ──
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed (app shutdown)");
  process.exit(0);
});

module.exports = connectDB;
