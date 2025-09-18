import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Health check route
app.get("/", (req, res) => {
  res.json({
    status: "running",
    message: "✅ Weather API is running! Try /api/weather?city=London",
    example: `/api/weather?city=London`,
  });
});

// ✅ Weather route
app.get("/api/weather", async (req, res) => {
  const city = req.query.city;
  if (!city) return res.status(400).json({ error: "City is required" });

  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "API key not configured" });

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&units=metric&appid=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== 200) {
      return res.status(data.cod).json({ error: data.message });
    }

    res.json({
      city: data.name,
      country: data.sys.country,
      temperature: data.main.temp,
      feels_like: data.main.feels_like,
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
    });
  } catch (error) {
    console.error("❌ Error fetching weather data:", error);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Weather API is running at http://localhost:${PORT}`);
});
