const express = require("express");
const smartRateLimiter = require("./index");

const app = express();

// Example MongoDB User Model (for demonstration)
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  userId: Number,
  customRateLimit: Number,
});
const User = mongoose.model("User", userSchema);

// Define userType function
const getUserType = (req) => req.headers["x-user-type"] || "guest";

// Apply rate limiter middleware
app.use(
  smartRateLimiter({
    userTypeFunc: getUserType,
    maxRequests: 100,
    timeframe: 60000, // 1 minute
    adaptive: true,
    dbType: "mongoose",
    dbClient: User,
  })
);

app.get("/", (req, res) => {
  res.send("Rate limiting is working!");
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
