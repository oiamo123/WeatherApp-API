const dotenv = require("dotnev").config();

const getWeather = async function (locations, timespan) {
  const query = locations
    .map((location) => {
      return `${location.city} ${location.country}`;
    })
    .join(";");

  try {
    const response = await fetch(
      `https://api.weatherstack.com/${timespan}?access_key=${process.env.WEATHER_STACK_API_KEY}&query=${query}`,
      { method: "GET" }
    );
    const result = await response.text();

    console.log(result);
  } catch (error) {
    console.error(error);
  }
};

module.exports = getWeather;
