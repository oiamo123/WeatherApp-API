const express = require("express");
const cors = require("cors");
const rateLimiter = require("express-rate-limit");
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const account = require("./account.js");
const getWeather = require("./Middleware/Weather.js");
const axios = require("axios");
const cache = require("node-cache");

const tileCache = new cache({ stdTTL: 3600, checkPeriod: 1800 });

const allowedOrigins = {
  development: "http://localhost:3000",
};

const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 100,
});

const app = express();
// app.set("trust proxy", 1);
// app.use(limiter);
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

app.get("/api/weather-tiles/:z/:x/:y", async (req, res) => {
  const { z, x, y } = req.params;
  res.set("Content-Type", "image/png");

  const cacheKey = `${z}:${x}:${y}`;
  const cachedTile = await tileCache.get(cacheKey);
  if (cachedTile) {
    res.send(cachedTile);
    return;
  }

  const url = `https://tile.openweathermap.org/map/precipitation_new/${z}/${x}/${y}.png?appid=${process.env.OPEN_WEATHER_API_KEY}`;

  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    if (response) {
      console.log(x, y, z);
    }

    res.send(response.data);
    await tileCache.set(cacheKey, response.data);
  } catch (error) {
    console.error("Error fetching tile:", error);
    res.status(500).send("Error fetching tile");
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is listening on port ${process.env.PORT}`);
});
