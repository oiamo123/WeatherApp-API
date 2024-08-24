const express = require("express");
const cors = require("cors");
const rateLimiter = require("express-rate-limit");
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const account = require("./account.js");
const schedule = require("node-schedule");

const allowedOrigins = {
  development: "http://localhost:4321",
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
app.use("/account", account);

mongoose.connect(process.env.URI).then((res) => {
  console.log("Connected to Mongo DB");
});

const getWeather = async function () {};

getWeather();

// ROUTES
app.get("/weather", (req, res) => {
  // get weather data from API for 7 days
  // send data to client
});

app.listen(process.env.PORT, () => {
  console.log(`Server is listening on port ${process.env.PORT}`);
});
