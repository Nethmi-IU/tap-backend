const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Firebase setup
const serviceAccount = require('./tap-logs-project-firebase-adminsdk-fbsvc-28ceba6faa.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Health check route (optional but useful)
app.get('/', (req, res) => {
  res.send("Backend is running ");
});

// Main API
app.post('/saveTaps', async (req, res) => {
  try {
    console.log(" Incoming body:", req.body);

    const sessionId = req.body.id;
    const device = req.body.var;

    // SAFE parsing of taps array
    let taps = [];
    try {
      taps = JSON.parse(req.body.taps);
    } catch (err) {
      console.error("Failed to parse taps array:", req.body.taps);
      return res.status(400).send("Invalid tap data format");
    }

    // ✅ Insert all taps safely
    for (let tap of taps) {
      let t;

      try {
        t = typeof tap === "string" ? JSON.parse(tap) : tap;
      } catch (err) {
        console.error("Individual tap parse error:", tap);
        continue; // skip broken tap instead of crashing
      }

      await db.collection('tap_logs').add({
        sessionId: sessionId,
        device: device,
        tapSequence: t.tapSequenceNumber,
        start: t.startTimestamp,
        end: t.endTimestamp,
        duration: t.endTimestamp - t.startTimestamp,
        interface: t.interface,
        interfaceSequence: t.interfaceSequence,
        createdAt: new Date() // optional but useful
      });
    }

    console.log("Data saved successfully");
    res.send("Data saved successfully");

  } catch (err) {
    console.error("FULL ERROR:", err);
    res.status(500).send(err.message); // show real error
  }
});

// IMPORTANT for Render (dynamic port)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));