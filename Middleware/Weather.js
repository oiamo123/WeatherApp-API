const dotenv = require("dotenv").config();

const getWeather = async function (data) {
  const response = await fetch(
    `https://api.openweathermap.org/data/3.0/onecall?lat=${data.lat}&lon=${data.lon}&exclude=minutely&units=metric&appid=${process.env.OPEN_WEATHER_API_KEY}`,
    { method: "GET" }
  );

  const results = await response.json();
  return results;
};

module.exports = getWeather;
