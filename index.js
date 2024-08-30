const express = require("express");
const cors = require("cors");
const rateLimiter = require("express-rate-limit");
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const account = require("./account.js");
const getWeather = require("./Middleware/Weather.js");

const allowedOrigins = {
  development: "http://localhost:3000",
};

const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 100,
});

const app = express();
// app.set("trust proxy", 1);
app.use(limiter);
app.use(
  cors({
    origin: allowedOrigins[process.env.ENV],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/api/account", account);

mongoose.connect(process.env.URI).then((res) => {
  console.log("Connected to Mongo DB");
});

// ROUTES
app.post("/api/weather", async (req, res) => {
  try {
    const forecast = await getWeather(req.body);

    res.status(200).json(forecast);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "There was an issue" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is listening on port ${process.env.PORT}`);
});
