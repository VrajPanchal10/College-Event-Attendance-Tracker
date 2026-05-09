const mongoose = require("mongoose");

const resetTokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true
  },
  code: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 900 // 15 minutes in seconds
  }
});

module.exports = mongoose.model("ResetToken", resetTokenSchema);
