const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const LAT = 59.91; // Oslo
const LON = 10.75;

const weatherDescriptions = {
  0: "☀️ Klart",
  1: "🌤️ Mest klart",
  2: "🌥️ Delvis skyet",
  3: "☁️ Overskyet",
  45: "🌫️ Tåke",
  48: "🌫️ Tåke (rim)",
  51: "🌦️ Lett yr",
  53: "🌦️ Yr",
  55: "🌧️ Kraftig yr",
  61: "🌦️ Lett regn",
  63: "🌧️ Regn",
  65: "🌧️ Kraftig regn",
  71: "🌨️ Lett snø",
  73: "🌨️ Snø",
  75: "❄️ Kraftig snø",
  80: "🌧️ Regnbyger",
  95: "⛈️ Tordenvær"
};

app.post("/webhook", async (req, res) => {
  const endpoint = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true`;

  try {
    const response = await axios.get(endpoint);
    const weather = response.data.current_weather;

    const code = weather.weathercode;
    const description = weatherDescriptions[code] || "🌈 Ukjent vær";

    const message = `${description}\n🌡️ Temperatur: ${weather.temperature} °C\n💨 Vind: ${weather.windspeed} m/s\n🕒 Tid: ${weather.time}`;

    return res.json({ fulfillmentText: message });
  } catch (err) {
    return res.json({ fulfillmentText: "Feil ved henting av værdata ❌" });
  }
});

app.get("/", (req, res) => res.send("Open-Meteo webhook fungerer!"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server kjører på port ${port}`));
