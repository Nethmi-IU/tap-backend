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
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();


// ✅ ROOT ROUTE (ADD HERE)
app.get('/', (req, res) => {
  res.send("Backend is running 🚀");
});


// ✅ MAIN API ROUTE
app.post('/saveTaps', async (req, res) => {
  try {
    const sessionId = req.body.id;
    const device = req.body.var;
    const taps = JSON.parse(req.body.taps);

    for (let tap of taps) {
      const t = JSON.parse(tap);

      await db.collection('tap_logs').add({
        sessionId: sessionId,
        device: device,
        tapSequence: t.tapSequenceNumber,
        start: t.startTimestamp,
        end: t.endTimestamp,
        duration: t.endTimestamp - t.startTimestamp,
        interface: t.interface,
        interfaceSequence: t.interfaceSequence
      });
    }

    res.send("Data saved successfully");

  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving data");
  }
});


// ✅ IMPORTANT: USE RENDER PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on " + PORT));
