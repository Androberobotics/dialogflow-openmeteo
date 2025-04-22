const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const fallbackLocation = {
  name: "Oslo",
  lat: 59.91,
  lon: 10.75
};

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

async function getCoordinates(place) {
  try {
    const response = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1`);
    const result = response.data.results?.[0];
    if (!result) return fallbackLocation;
    return { name: result.name, lat: result.latitude, lon: result.longitude };
  } catch (err) {
    console.error("Geokoding feilet:", err.message);
    return fallbackLocation;
  }
}

app.post("/webhook", async (req, res) => {
  const location = req.body.queryResult?.parameters?.location;
  const place = typeof location === "string" ? location : location?.city || location?.country || fallbackLocation.name;

  const { name, lat, lon } = await getCoordinates(place);

  try {
    const response = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
    const weather = response.data.current_weather;
    const code = weather.weathercode;
    const description = weatherDescriptions[code] || "🌈 Ukjent vær";

    const message = `📍 ${name}\n${description}\n🌡️ ${weather.temperature} °C\n💨 ${weather.windspeed} m/s\n🕒 ${weather.time}`;
    return res.json({ fulfillmentText: message });

  } catch (err) {
    console.error("Feil ved henting av vær:", err.message);
    return res.json({ fulfillmentText: "Beklager, jeg klarte ikke hente værdata akkurat nå ❌" });
  }
});

app.get("/", (req, res) => res.send("Værboten kjører!"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server kjører på port ${port}`));
